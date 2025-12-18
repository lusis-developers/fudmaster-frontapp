<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PayphoneService from '@/services/payphone.service'
import usersService, { type RegisterFromPaymentBody, type RegisterFromPaymentResponse } from '@/services/users.service'
import { useCheckoutStore } from '@/stores/checkout'
import { useUserStore } from '@/stores/user'
import { track, sendEvent } from '@/services/facebook.service'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')
const status = ref<'Pending' | 'Approved' | 'Rejected' | ''>('')
const transactionId = ref('')
const clientTransactionId = ref('')
const user = ref<{ name?: string; email?: string } | null>(null)
const checkoutStore = useCheckoutStore()

function goLogin() {
  const email = user.value?.email || ''
  router.push({ path: '/login', query: { msg: 'Revisa tu correo para activar/ver tu cuenta.', email } })
}

function goCheckout() {
  router.push('/checkout')
}

onMounted(async () => {
  const id = (route.query.id as string) || ''
  const ctId = (route.query.clientTransactionId as string) || ''

  transactionId.value = id
  clientTransactionId.value = ctId

  checkoutStore.hydrate()
  user.value = { name: checkoutStore.name, email: checkoutStore.email }

  if (!id || !ctId) {
    error.value = 'Parámetros inválidos en la respuesta de pago.'
    loading.value = false
    return
  }

  try {
    const res = await PayphoneService.confirmPayment(id, ctId)
    status.value = res.transactionStatus
    if (status.value === 'Approved') {
      const resAny: any = res as any
      const refStr: string = String(resAny.reference || '')
      const parts = refStr.split(' - ').map(s => s.trim()).filter(Boolean)
      const refName = parts.length >= 3 ? parts[parts.length - 2] : undefined
      const refEmail = parts.length >= 2 ? parts[parts.length - 1] : undefined

      const finalEmail = String(user.value?.email || resAny.email || refEmail || 'sin-correo@fudmaster.com')
      const finalName = String(user.value?.name || refName || 'Usuario Fudmaster')

      const info = {
        name: finalName,
        email: finalEmail,
        plan: 'Expert Annual',
        transactionId: res.transactionId,
        clientTransactionId: res.clientTransactionId,
      }
      localStorage.setItem('user', JSON.stringify(info))

      const amountDollars = typeof resAny.amount === 'number' ? Math.round(resAny.amount) / 100 : 199
      const payload: RegisterFromPaymentBody = {
        email: finalEmail,
        transactionStatus: res.transactionStatus,
        statusCode: 3,
        authorizationCode: String(resAny.authorizationCode || res.transactionId),
        transactionId: res.transactionId,
        amount: amountDollars,
        currency: String(resAny.currency || 'USD'),
        reference: `Plan Expert - FM-EXPERT-ANNUAL - ${finalName} - ${finalEmail}`,
      }

      try {
        const { data } = await usersService.registerFromPayment<RegisterFromPaymentResponse>(payload)
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          
          // Actualizar el store global de usuario inmediatamente
          const u = data.user as any
          userStore.setUser({
            id: u.id,
            name: u.name,
            email: u.email,
            accountType: (u.account_type || u.accountType || 'expert')
          })
        }
        checkoutStore.clear()
      } catch (err: any) {
        console.error('Error registrando usuario desde pago', err)
      }
      track('Purchase', { value: amountDollars, currency: String(resAny.currency || 'USD'), contents: [{ id: 'FM-EXPERT-ANNUAL', quantity: 1 }] })
      sendEvent('Purchase', { value: amountDollars, currency: String(resAny.currency || 'USD'), contents: [{ id: 'FM-EXPERT-ANNUAL', quantity: 1 }] })
    }
  } catch (e: any) {
    error.value = e?.message || 'No se pudo confirmar el pago.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="pay-response">
    <div class="card">
      <div class="brand">
        <img src="/src/assets/fudmaster-color.png" alt="fudmaster-logo" />
      </div>

      <h2 class="title">Resultado del pago</h2>

      <div v-if="loading" class="state loading">
        <i class="fa-solid fa-spinner fa-spin" /> Confirmando tu pago...
      </div>

      <div v-else>
        <div v-if="error" class="state error">
          <i class="fa-solid fa-triangle-exclamation" /> {{ error }}
        </div>

        <template v-else>
          <div v-if="status === 'Approved'" class="state success">
            <i class="fa-solid fa-circle-check" />
            <span>Pago aprobado</span>
          </div>

          <div v-else-if="status === 'Rejected'" class="state error">
            <i class="fa-solid fa-circle-xmark" />
            <span>Pago rechazado</span>
          </div>

          <div v-else class="state pending">
            <i class="fa-regular fa-clock" />
            <span>Pago pendiente</span>
          </div>

          <div class="details">
            <div class="row">
              <span>ID de transacción</span>
              <span class="mono">{{ transactionId }}</span>
            </div>
            <div class="row">
              <span>ID cliente</span>
              <span class="mono">{{ clientTransactionId }}</span>
            </div>
            <div class="row" v-if="user">
              <span>Usuario</span>
              <span class="mono">{{ user?.name }} · {{ user?.email }}</span>
            </div>
          </div>

          <div class="actions">
            <button v-if="status === 'Approved'" class="cta green" @click="goLogin">
              Ir al login
            </button>
            <button v-else class="cta blue" @click="goCheckout">
              Intentar nuevamente
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
  </template>

<style lang="scss" scoped>
.pay-response {
  width: 100%;
  padding: 24px 16px;
}

.card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: $white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  display: grid;
  gap: 16px;
}

.brand img {
  width: 120px;
}

.title {
  color: $FUDMASTER-DARK;
  font-size: 22px;
  margin: 0;
}

.state {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.success {
  color: $FUDMASTER-GREEN;
}

.error {
  color: $alert-error;
}

.pending {
  color: rgba($FUDMASTER-DARK, 0.6);
}

.details {
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba($FUDMASTER-DARK, 0.7);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.actions {
  display: grid;
  gap: 10px;
}

.cta {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 700;
  color: $white;
}

.cta.green {
  background: $FUDMASTER-GREEN;
}

.cta.blue {
  background: $FUDMASTER-BLUE;
}

@media (min-width: 960px) {
  .card {
    padding: 24px;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import paymentService from '@/services/payment.service'
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

const isConfirming = ref(false)

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

  if (!id || !ctId) {
    error.value = 'Enlace de pago inválido (faltan parámetros).'
    loading.value = false
    return
  }

  if (isConfirming.value) {
    console.warn('⚠️ Evitando doble confirmación')
    return
  }
  isConfirming.value = true

  transactionId.value = id
  clientTransactionId.value = ctId

  checkoutStore.hydrate()
  user.value = { name: checkoutStore.name || '', email: checkoutStore.email || '' }

  try {
    console.log('🚀 Iniciando confirmación en Backend...', { id, ctId })

    // Pass '0' if no user logged in (backend handles creation/lookup)
    const userId = userStore.id || '0'

    const { data } = await paymentService.confirmPayment(userId, id, ctId)

    if (data.success) {
      status.value = 'Approved'

      const u = data.user
      if (u) {
        localStorage.setItem('user', JSON.stringify(u))

        userStore.setUser({
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          accountType: (u.account_type || u.accountType || 'expert')
        })

        user.value = { name: u.name, email: u.email }
      }

      checkoutStore.clear()

      // Tracking
      const amountDollars = 1
      track('Purchase', { value: amountDollars, currency: 'USD', contents: [{ id: 'FM-FOUNDER-LIFETIME', quantity: 1 }] })
      sendEvent('Purchase', { value: amountDollars, currency: 'USD', contents: [{ id: 'FM-FOUNDER-LIFETIME', quantity: 1 }] })

    } else {
      throw new Error(data.message || 'El pago fue procesado pero no aprobado.')
    }

  } catch (err: any) {
    console.error('❌ Error confirmando pago:', err)
    status.value = 'Rejected'
    error.value = err.response?.data?.message || err.message || 'Hubo un problema confirmando tu pago. Por favor contacta a soporte.'
  } finally {
    loading.value = false
    // NOTE: We do not reset isConfirming to false to prevent retry loops on this view
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
        <i class="fa-solid fa-spinner fa-spin" /> 
        <span>Verificando pago seguro...</span>
      </div>

      <div v-else>
        <div v-if="error || status === 'Rejected'" class="state error">
          <i class="fa-solid fa-circle-xmark" />
          <div class="error-msg">
            <span>Pago no completado</span>
            <small>{{ error }}</small>
          </div>
        </div>

        <template v-else-if="status === 'Approved'">
          <div class="state success">
            <i class="fa-solid fa-circle-check" />
            <span>¡Pago Exitoso!</span>
          </div>

          <div class="details">
            <div class="row">
              <span>Referencia</span>
              <span class="mono">{{ transactionId }}</span>
            </div>
            <div class="row" v-if="user?.email">
              <span>Enviado a</span>
              <span class="mono">{{ user.email }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="cta green" @click="goLogin">
              Ingresar a la plataforma
            </button>
          </div>
        </template>

        <div class="actions" v-if="status === 'Rejected' || error">
          <button class="cta blue" @click="goCheckout">
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ... (Tus estilos estaban bien, los mantengo igual)
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
  text-align: center;
}

.brand img {
  width: 120px;
  margin: 0 auto;
}

.title {
  color: $FUDMASTER-DARK;
  font-size: 22px;
  margin: 0;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  padding: 20px 0;

  i {
    font-size: 3rem;
  }
}

.success {
  color: $FUDMASTER-GREEN;
}

.error {
  color: $alert-error;
}

.loading {
  color: $FUDMASTER-BLUE;
}

.error-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  small {
    font-weight: 400;
    opacity: 0.8;
  }
}

.details {
  display: grid;
  gap: 10px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
  text-align: left;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba($FUDMASTER-DARK, 0.7);
  font-size: 0.9rem;
}

.mono {
  font-family: ui-monospace, monospace;
  font-weight: 600;
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
  padding: 14px;
  cursor: pointer;
  font-weight: 700;
  color: $white;
  font-size: 1rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.cta.green {
  background: $FUDMASTER-GREEN;
}

.cta.blue {
  background: $FUDMASTER-BLUE;
}

@media (min-width: 960px) {
  .card {
    padding: 30px;
  }
}
</style>
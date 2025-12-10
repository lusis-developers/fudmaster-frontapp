<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PayphoneService from '@/services/payphone.service'
import usersService from '@/services/users.service'
import { useCheckoutStore } from '@/stores/checkout'

const checkoutStore = useCheckoutStore()
const name = ref('')
const email = ref('')
const loading = ref(false)
const error = ref('')

const expiresAt = ref<number>(Date.now() + 24 * 60 * 60 * 1000)
const remaining = ref<string>('')

function updateTimer() {
  const diff = expiresAt.value - Date.now()
  const clamped = Math.max(diff, 0)
  const h = Math.floor(clamped / (1000 * 60 * 60))
  const m = Math.floor((clamped % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((clamped % (1000 * 60)) / 1000)
  remaining.value = `${h}h ${m}m ${s}s`
}

onMounted(() => {
  updateTimer()
  const id = setInterval(updateTimer, 1000)
    ; (window as any)._checkout_timer = id
  checkoutStore.hydrate()
  if (checkoutStore.name) name.value = checkoutStore.name
  if (checkoutStore.email) email.value = checkoutStore.email
})

onBeforeUnmount(() => {
  const id = (window as any)._checkout_timer
  if (id) clearInterval(id)
})

const canPay = computed(() => {
  return name.value.trim().length >= 3 && /.+@.+\..+/.test(email.value.trim()) && !loading.value
})

async function pay() {
  if (!canPay.value) return
  loading.value = true
  error.value = ''
  try {
    const { data: existsRes } = await usersService.existsByEmail<{ message: string; exists: boolean }>(email.value.trim())
    if (existsRes?.exists) {
      error.value = 'Ya existe una cuenta con ese correo. Por favor inicia sesión o usa otro correo.'
      return
    }
    const result = await PayphoneService.preparePayment({
      productId: 'FM-EXPERT-ANNUAL',
      productName: 'Plan Expert',
      price: 297,
      customerName: name.value.trim(),
      customerEmail: email.value.trim(),
    })
    if (result.payWithPayPhone) {
      checkoutStore.setFromForm(name.value, email.value)
      checkoutStore.setClientTransactionId(result.clientTransactionId)
      PayphoneService.redirectToPayment(result.payWithPayPhone)
    } else {
      error.value = 'No se pudo obtener la URL de pago.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Error al preparar el pago.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="checkout">
    <div class="container">
      <div class="left">
        <div class="brand">
          <img src="/src/assets/fudmaster-color.png" alt="fudmaster-logo" />
        </div>
        <h2 class="title">Escribe tu nombre y correo electrónico</h2>
        <p class="subtitle">Tu pago quedará asociado a este correo.</p>

        <form class="form" @submit.prevent="pay">
          <label for="name" class="label">Nombre completo</label>
          <div class="input">
            <i class="fa-solid fa-user" />
            <input id="name" type="text" v-model.trim="name" placeholder="Tu nombre" />
          </div>

          <label for="email" class="label">Correo electrónico</label>
          <div class="input">
            <i class="fa-regular fa-envelope" />
            <input id="email" type="email" v-model.trim="email" placeholder="tu@correo.com" autocomplete="email" />
          </div>

          <div v-if="error" class="error">
            <i class="fa-solid fa-triangle-exclamation" />
            {{ error }}
          </div>

          <button class="cta" type="submit" :disabled="!canPay">
            <span v-if="!loading">Pagar con Payphone</span>
            <span v-else><i class="fa-solid fa-spinner fa-spin" /> Procesando...</span>
          </button>

          <p class="legal">Al continuar aceptas nuestros Términos de uso.</p>
        </form>
      </div>

      <div class="right">
        <div class="card">
          <h3 class="plan">Plan Expert</h3>
          <p class="info">Pago anual con renovación automática cada año</p>

          <div class="pricing">
            <div class="row">
              <span>Total a pagar</span>
              <span class="price">$ 297</span>
            </div>
            <div class="row small">
              <span class="strike">Precio normal $249</span>
              <span class="save">Ahorras $50</span>
            </div>
            <div class="row small">
              <span>Precio mensual $ 17</span>
            </div>
          </div>

          <div class="timer">
            El precio especial termina en: {{ remaining }}
          </div>

          <div class="benefits">
            <div class="title">Lo que obtienes con el plan</div>
            <ul>
              <li><i class="fa-solid fa-check" /> Eventos exclusivos como la Platzi Conf</li>
              <li><i class="fa-solid fa-check" /> Más de 1900 cursos y 17 escuelas</li>
              <li><i class="fa-solid fa-check" /> Certificados digitales</li>
              <li><i class="fa-solid fa-check" /> English Academy...</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkout {
  width: 100%;
  padding: 24px 16px;
}

.container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 960px) {
  .container {
    grid-template-columns: 2fr 1.4fr;
  }
}

.left {
  display: grid;
  gap: 12px;
}

.brand img {
  width: 120px;
}

.title {
  color: $FUDMASTER-DARK;
  font-size: 24px;
  margin: 0;
}

.subtitle {
  color: rgba($FUDMASTER-DARK, 0.6);
  font-size: 14px;
  margin: 0 0 8px;
}

.form {
  display: grid;
  gap: 12px;
}

.label {
  font-size: 13px;
  color: rgba($FUDMASTER-DARK, 0.7);
}

.input {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba($FUDMASTER-DARK, 0.15);
  border-radius: 10px;
  padding: 12px 14px;
  background: rgba($FUDMASTER-DARK, 0.06);
}

.input i {
  color: $FUDMASTER-DARK;
}

.input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: $FUDMASTER-DARK;
  font-size: 16px;
}

.error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $alert-error;
  background: $alert-error-bg;
  border: 1px solid rgba($alert-error, 0.3);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}

.cta {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: $FUDMASTER-GREEN;
  color: $white;
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
}

.legal {
  text-align: center;
  color: rgba($FUDMASTER-DARK, 0.6);
  font-size: 12px;
}

.right .card {
  display: grid;
  gap: 12px;
  background: $white;
  border-radius: 16px;
  padding: 16px;
}

.plan {
  color: $FUDMASTER-DARK;
  font-weight: 700;
  font-size: 20px;
  margin: 0;
}

.info {
  color: #777;
  font-size: 14px;
  margin: 0;
}

.pricing {
  display: grid;
  gap: 6px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row.small {
  font-size: 14px;
  color: #777;
}

.price {
  font-weight: 700;
}

.strike {
  text-decoration: line-through;
  color: #777;
}

.save {
  color: $FUDMASTER-GREEN;
  font-weight: 600;
}

.timer {
  background: $FUDMASTER-GREEN;
  color: $white;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 700;
}

.benefits .title {
  color: $FUDMASTER-DARK;
  font-weight: 700;
}

.benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.benefits li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}
</style>

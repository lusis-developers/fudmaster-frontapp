<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PayphoneService from '@/services/payphone.service'
import usersService from '@/services/users.service'
import { useCheckoutStore } from '@/stores/checkout'
import { useRouter } from 'vue-router'
import { track, sendEvent } from '@/services/facebook.service'
import ExitIntentModal from '@/components/ExitIntentModal.vue'

const checkoutStore = useCheckoutStore()
const router = useRouter()
const name = ref('')
const email = ref('')
const loading = ref(false)
const error = ref('')

// Timer logic
const expiresAt = ref<number>(Date.now() + 24 * 60 * 60 * 1000)
const remaining = ref<string>('')

// Exit Intent logic
const exitOpen = ref(false)
const allowLeave = ref(false)
let popHandler: ((ev: PopStateEvent) => void) | null = null

function updateTimer() {
  const diff = expiresAt.value - Date.now()
  const clamped = Math.max(diff, 0)
  const h = Math.floor(clamped / (1000 * 60 * 60))
  const m = Math.floor((clamped % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((clamped % (1000 * 60)) / 1000)
  // Formato más limpio estilo reloj digital
  remaining.value = `${h}h : ${m}m : ${s}s`
}

onMounted(() => {
  updateTimer()
  const id = setInterval(updateTimer, 1000)
    ; (window as any)._checkout_timer = id
  checkoutStore.hydrate()
  if (checkoutStore.name) name.value = checkoutStore.name
  if (checkoutStore.email) email.value = checkoutStore.email
  track('ViewContent', { content_name: 'Checkout Lifetime' })
  sendEvent('ViewContent', { content_name: 'Checkout Lifetime' })

  // Exit Intent setup
  try {
    history.pushState({ checkoutGuard: true }, '', location.href)
    popHandler = () => {
      if (!allowLeave.value) {
        exitOpen.value = true
        history.pushState({ checkoutGuard: true }, '', location.href)
      }
    }
    window.addEventListener('popstate', popHandler)
  } catch {}
})

onBeforeUnmount(() => {
  const id = (window as any)._checkout_timer
  if (id) clearInterval(id)
  try { if (popHandler) window.removeEventListener('popstate', popHandler) } catch {}
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
      error.value = 'Ya existe una cuenta con ese correo. Inicia sesión para mantener tu historial.'
      return
    }
    track('InitiateCheckout', { value: 297, currency: 'USD' })
    sendEvent('InitiateCheckout', { value: 297, currency: 'USD' })
    
    const result = await PayphoneService.preparePayment({
      productId: 'FM-FOUNDER-LIFETIME', // Actualizado ID producto
      productName: 'Plan Founder Lifetime',
      price: 297,
      customerName: name.value.trim(),
      customerEmail: email.value.trim(),
    })
    
    if (result.payWithPayPhone) {
      checkoutStore.setFromForm(name.value, email.value)
      checkoutStore.setClientTransactionId(result.clientTransactionId)
      track('AddPaymentInfo')
      sendEvent('AddPaymentInfo', { value: 297, currency: 'USD' })
      PayphoneService.redirectToPayment(result.payWithPayPhone)
    } else {
      error.value = 'Error de conexión con la pasarela.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Error al preparar el pago.'
  } finally {
    loading.value = false
  }
}

function goLogin() { router.push('/login') }
function stayOnCheckout() { exitOpen.value = false }
function leaveCheckout() {
  exitOpen.value = false
  allowLeave.value = true
  history.back()
}
</script>

<template>
  <div class="checkout-wrapper">
    <div class="container">
      
      <div class="left">
        <div class="header-secure">
          <div class="brand">
            <img src="/src/assets/fudmaster-color.png" alt="fudmaster-logo" />
          </div>
          <div class="secure-badge">
            <i class="fa-solid fa-lock" /> Checkout Seguro SSL
          </div>
        </div>

        <h1 class="main-title">Únete como Founder: <span class="highlight">Acceso de por vida</span></h1>
        <p class="subtitle">Estás a un paso de transformar tu negocio gastronómico para siempre.</p>

        <form class="form" @submit.prevent="pay">
          <div class="form-group">
            <label for="name">Nombre completo</label>
            <div class="input-wrapper">
              <i class="fa-solid fa-user icon" />
              <input id="name" type="text" v-model.trim="name" placeholder="Ej. Mauro Salgan" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <div class="input-wrapper">
              <i class="fa-regular fa-envelope icon" />
              <input id="email" type="email" v-model.trim="email" placeholder="tu@mejorcorreo.com" autocomplete="email" />
            </div>
          </div>

          <div v-if="error" class="error-box">
            <i class="fa-solid fa-circle-exclamation" />
            <span>{{ error }}</span>
          </div>

          <div class="login-row">
            <span>¿Ya eres alumno?</span>
            <button type="button" class="link-btn" @click="goLogin">Acceder aquí</button>
          </div>

          <div class="cta-container">
            <button class="cta-button" type="submit" :disabled="!canPay">
              <span v-if="!loading" class="btn-content">
                Completar Inscripción Segura <i class="fa-solid fa-arrow-right" />
              </span>
              <span v-else><i class="fa-solid fa-spinner fa-spin" /> Procesando pago...</span>
            </button>
            
            <div class="payment-methods">
              <i class="fa-brands fa-cc-visa" />
              <i class="fa-brands fa-cc-mastercard" />
              <i class="fa-brands fa-cc-amex" />
              <span class="secure-text"><i class="fa-solid fa-shield-halved" /> Pagos encriptados</span>
            </div>
          </div>

          <p class="legal-text">Garantía de satisfacción aplicada. Al pagar aceptas nuestros términos.</p>
        </form>
      </div>

      <div class="right">
        <div class="order-card">
          <div class="card-header">
            <h3 class="plan-name">Plan Founder Vitalicio</h3>
            <span class="badge-lifetime">DE POR VIDA</span>
          </div>

          <div class="timer-box">
            <span class="timer-label">🔥 Oferta Flash expira en:</span>
            <span class="timer-digits">{{ remaining }}</span>
          </div>

          <div class="pricing-stack">
            <div class="price-row total">
              <span>Inversión Total</span>
              <span class="amount">$297 <span class="currency">USD</span></span>
            </div>
            <div class="price-row savings">
              <span class="original">Precio Regular: $990</span>
              <span class="saved-amount">AHORRAS $693 hoy</span>
            </div>
            <div class="price-row note">
              <i class="fa-solid fa-check-circle" /> Un solo pago único. Sin mensualidades.
            </div>
          </div>

          <div class="divider" />

          <div class="benefits-list">
            <h4>Tu acceso incluye todo:</h4>
            <ul>
              <li>
                <i class="fa-solid fa-check" /> 
                <span><strong>Acceso de por vida</strong> a la escuela</span>
              </li>
              <li>
                <i class="fa-solid fa-check" /> 
                <span>Certificados digitales verificables</span>
              </li>
              <li>
                <i class="fa-solid fa-check" /> 
                <span>Actualizaciones futuras (2025/26) sin costo</span>
              </li>
              <li>
                <i class="fa-solid fa-check" /> 
                <span>Comunidad Privada de Dueños</span>
              </li>
              <li>
                <i class="fa-solid fa-file-excel" /> 
                <span>Plantillas de Excel descargables</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mini-proof">
          <div class="stars">★★★★★</div>
          <p>"La mejor inversión para mi restaurante este año"</p>
        </div>
      </div>

    </div>
  </div>

  <ExitIntentModal
    :open="exitOpen"
    title="¡No pierdas tu estatus de Founder!"
    message="Estás a punto de abandonar la oferta de $297. Si sales, el precio volverá a $990 y perderás los bonos de por vida."
    @close="stayOnCheckout"
    @stay="stayOnCheckout"
    @leave="leaveCheckout"
  />
</template>

<style lang="scss" scoped>
// --- TUS VARIABLES ---
$FUDMASTER-PINK: #DA4167;
$FUDMASTER-DARK: #010D27;
$FUDMASTER-LIGHT: #f5f3ef;
$FUDMASTER-BLUE: #0a81d1;
$FUDMASTER-ORANGE: #F96E46;
$FUDMASTER-GREEN: #2BBB92;
$white: #ffffff;
$alert-error: #ef4444;
$alert-error-bg: rgba($alert-error, 0.1);

// --- ESTILOS ---

.checkout-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: $FUDMASTER-LIGHT; // Fondo claro para limpieza visual
  padding: 40px 20px;
  font-family: 'Inter', sans-serif; // Asegúrate de tener una fuente limpia
}

.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr;
}

@media (min-width: 960px) {
  .container {
    grid-template-columns: 1.2fr 1fr; // Izquierda un poco más ancha
    align-items: start;
  }
}

// IZQUIERDA
.left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-secure {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  
  .brand img {
    height: 40px; // Ajusta según tu logo
    width: auto;
  }
  
  .secure-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba($FUDMASTER-DARK, 0.5);
    font-weight: 600;
    background: rgba($FUDMASTER-DARK, 0.05);
    padding: 6px 12px;
    border-radius: 20px;
  }
}

.main-title {
  font-size: 28px;
  line-height: 1.2;
  color: $FUDMASTER-DARK;
  font-weight: 800;
  margin: 0;
  
  .highlight {
    color: $FUDMASTER-ORANGE; // Resaltar "Por vida"
    display: block; // En movil bajará de linea, se ve mejor
    @media(min-width: 768px) { display: inline; }
  }
}

.subtitle {
  color: rgba($FUDMASTER-DARK, 0.7);
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
}

// FORMULARIO
.form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: $white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba($FUDMASTER-DARK, 0.04);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-size: 14px;
    font-weight: 600;
    color: $FUDMASTER-DARK;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid transparent; // Preparado para focus
  background: $FUDMASTER-LIGHT;
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.2s;
  
  &:focus-within {
    background: $white;
    border-color: $FUDMASTER-BLUE;
    box-shadow: 0 0 0 4px rgba($FUDMASTER-BLUE, 0.1);
  }
  
  .icon {
    color: rgba($FUDMASTER-DARK, 0.4);
    font-size: 18px;
  }
  
  input {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    font-size: 16px;
    color: $FUDMASTER-DARK;
    font-weight: 500;
    
    &::placeholder {
      color: rgba($FUDMASTER-DARK, 0.3);
    }
  }
}

.error-box {
  background: $alert-error-bg;
  color: $alert-error;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  font-size: 14px;
  color: rgba($FUDMASTER-DARK, 0.6);
  
  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: $FUDMASTER-BLUE;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }
}

// CTA SECTION
.cta-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cta-button {
  width: 100%;
  background: $FUDMASTER-GREEN;
  color: $white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, filter 0.2s;
  box-shadow: 0 10px 20px -5px rgba($FUDMASTER-GREEN, 0.4);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.05);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}

.payment-methods {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  color: rgba($FUDMASTER-DARK, 0.4);
  font-size: 24px;
  
  .secure-text {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    border-left: 1px solid rgba($FUDMASTER-DARK, 0.1);
    padding-left: 15px;
  }
}

.legal-text {
  text-align: center;
  font-size: 12px;
  color: rgba($FUDMASTER-DARK, 0.4);
  margin: 0;
}


// DERECHA (TARJETA)
.order-card {
  background: $white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba($FUDMASTER-DARK, 0.05);
  box-shadow: 0 20px 40px -10px rgba($FUDMASTER-DARK, 0.1);
  position: relative;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .plan-name {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: $FUDMASTER-DARK;
    max-width: 60%;
  }
  
  .badge-lifetime {
    background: $FUDMASTER-DARK;
    color: $white;
    font-size: 10px;
    font-weight: 900;
    padding: 4px 8px;
    border-radius: 6px;
    letter-spacing: 0.5px;
  }
}

.timer-box {
  background: $FUDMASTER-ORANGE;
  color: $white;
  padding: 10px 16px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  margin-bottom: 20px;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba($FUDMASTER-ORANGE, 0.3);
}

.pricing-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &.total {
      font-size: 18px;
      color: $FUDMASTER-DARK;
      font-weight: 600;
      
      .amount {
        font-size: 32px;
        font-weight: 900;
        letter-spacing: -1px;
        color: $FUDMASTER-DARK;
      }
      .currency {
        font-size: 14px;
        vertical-align: middle;
        font-weight: 600;
        color: rgba($FUDMASTER-DARK, 0.5);
      }
    }
    
    &.savings {
      font-size: 14px;
      
      .original {
        text-decoration: line-through;
        color: rgba($FUDMASTER-DARK, 0.4);
      }
      
      .saved-amount {
        color: $FUDMASTER-PINK; // Usamos el PINK para resaltar el ahorro
        font-weight: 800;
        background: rgba($FUDMASTER-PINK, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
    
    &.note {
      font-size: 13px;
      color: $FUDMASTER-GREEN; // Verde para confirmar que es un solo pago
      justify-content: flex-start;
      gap: 6px;
      font-weight: 600;
      margin-top: 4px;
    }
  }
}

.divider {
  height: 1px;
  background: rgba($FUDMASTER-DARK, 0.08);
  margin: 24px 0;
}

.benefits-list {
  h4 {
    margin: 0 0 16px;
    font-size: 15px;
    color: $FUDMASTER-DARK;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 14px;
  }
  
  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14px;
    color: rgba($FUDMASTER-DARK, 0.8);
    line-height: 1.4;
    
    i {
      color: $FUDMASTER-GREEN;
      margin-top: 2px; // Alinear ópticamente con texto
    }
    
    strong {
      color: $FUDMASTER-DARK;
    }
  }
}

.mini-proof {
  text-align: center;
  margin-top: 20px;
  
  .stars {
    color: #FFC107; // Oro standard para estrellas
    letter-spacing: 2px;
    font-size: 18px;
  }
  
  p {
    font-size: 12px;
    font-style: italic;
    color: rgba($FUDMASTER-DARK, 0.6);
    margin: 4px 0 0;
  }
}
</style>
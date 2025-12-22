<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PayphoneService from '@/services/payphone.service'
import usersService from '@/services/users.service'
import { useCheckoutStore } from '@/stores/checkout'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { track, sendEvent } from '@/services/facebook.service'
import ExitIntentModal from '@/components/ExitIntentModal.vue'

const checkoutStore = useCheckoutStore()
const userStore = useUserStore()
const router = useRouter()
const name = ref('')
const email = ref('')
const loading = ref(false)
const isLoggingOut = ref(false)
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
  
  // Hydrate stores
  checkoutStore.hydrate()
  userStore.hydrate()

  // Pre-fill from User Store if logged in
  if (userStore.isAuthenticated) {
    if (userStore.email) email.value = userStore.email
    if (userStore.name) name.value = userStore.name
  } else {
    // Fallback to checkout store
    if (checkoutStore.name) name.value = checkoutStore.name
    if (checkoutStore.email) email.value = checkoutStore.email
  }

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

const isUserLoggedIn = computed(() => userStore.isAuthenticated)

async function logoutAndReset() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  
  // Simular delay para UX (que el usuario vea el spinner)
  await new Promise(resolve => setTimeout(resolve, 800))
  
  userStore.clear()
  name.value = ''
  email.value = ''
  isLoggingOut.value = false
}

async function pay() {
  if (!canPay.value) return
  loading.value = true
  error.value = ''
  try {
    // Si NO está logueado, verificamos si el correo ya existe
    if (!userStore.isAuthenticated) {
      const { data: existsRes } = await usersService.existsByEmail<{ message: string; exists: boolean }>(email.value.trim())
      if (existsRes?.exists) {
        error.value = 'Ya existe una cuenta con ese correo. Inicia sesión para mantener tu historial.'
        loading.value = false // Importante resetear loading
        return
      }
    }

    track('InitiateCheckout', { value: 297, currency: 'USD' })
    sendEvent('InitiateCheckout', { value: 297, currency: 'USD' })
    
    const result = await PayphoneService.preparePayment({
      productId: 'FM-FOUNDER-LIFETIME',
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
              <input 
                id="email" 
                type="email" 
                v-model.trim="email" 
                placeholder="tu@mejorcorreo.com" 
                autocomplete="email" 
                :disabled="isUserLoggedIn"
                :class="{ 'input-locked': isUserLoggedIn }"
              />
            </div>
            <div v-if="isUserLoggedIn" class="not-you-link">
              <small><i class="fa-solid fa-circle-check"></i> Conectado como <strong>{{ email }}</strong></small>
              <button type="button" class="text-btn" @click="logoutAndReset" :disabled="isLoggingOut">
                <span v-if="!isLoggingOut">¿No eres tú? Cerrar sesión</span>
                <span v-else><i class="fa-solid fa-spinner fa-spin"></i> Cerrando...</span>
              </button>
            </div>
          </div>

          <div v-if="error" class="error-box">
            <i class="fa-solid fa-circle-exclamation" />
            <span>{{ error }}</span>
          </div>

          <div class="login-row" v-if="!isUserLoggedIn">
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
// --- ESTILOS ---

.checkout-wrapper {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
  
  // Variables CSS locales para manejo de temas (Dark/Light)
  --bg-page: #{$FUDMASTER-LIGHT};
  --bg-card: #{$white};
  --text-main: #{$FUDMASTER-DARK};
  --text-muted: rgba(1, 13, 39, 0.7);
  --input-bg: #{$FUDMASTER-LIGHT};
  --input-border: transparent;
  --input-text: #{$FUDMASTER-DARK};
  --border-color: rgba(1, 13, 39, 0.08);
  --shadow-color: rgba(1, 13, 39, 0.1);
  --highlight-bg: rgba(218, 65, 103, 0.1); // Pink bg

  // Soporte Dark Mode
  :global([data-theme='dark']) & {
    --bg-page: #01040a; // Muy oscuro
    --bg-card: #0b1629; // Un poco más claro
    --text-main: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.6);
    --input-bg: rgba(255, 255, 255, 0.05);
    --input-border: rgba(255, 255, 255, 0.1);
    --input-text: #ffffff;
    --border-color: rgba(255, 255, 255, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.5);
    --highlight-bg: rgba(218, 65, 103, 0.2);
  }

  background-color: var(--bg-page);
  color: var(--text-main);
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
    height: 40px;
    width: auto;
  }
  
  .secure-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    background: var(--bg-card);
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid var(--border-color);
  }
}

.main-title {
  font-size: 28px;
  line-height: 1.2;
  color: var(--text-main);
  font-weight: 800;
  margin: 0;
  
  .highlight {
    color: $FUDMASTER-ORANGE;
    display: block;
    @media(min-width: 768px) { display: inline; }
  }
}

.subtitle {
  color: var(--text-muted);
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
  background: var(--bg-card);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.2s;
  
  &:focus-within {
    background: var(--bg-card);
    border-color: $FUDMASTER-BLUE;
    box-shadow: 0 0 0 4px rgba($FUDMASTER-BLUE, 0.1);
  }
  
  .icon {
    color: var(--text-muted);
    font-size: 18px;
  }
  
  input {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    font-size: 16px;
    color: var(--input-text);
    font-weight: 500;
    
    &::placeholder {
      color: var(--text-muted);
      opacity: 0.5;
    }
  }
  .input-locked {
    background-color: rgba($FUDMASTER-GREEN, 0.1);
    color: var(--text-muted);
    cursor: not-allowed;
    border-color: rgba($FUDMASTER-GREEN, 0.3);
  }

}

.not-you-link {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-page);
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  
  strong {
    color: var(--text-main);
    font-weight: 600;
  }

  i {
    color: $FUDMASTER-GREEN;
    margin-right: 6px;
  }

  .text-btn {
    background: transparent;
    border: 1px solid rgba($FUDMASTER-ORANGE, 0.3);
    color: $FUDMASTER-ORANGE;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover:not(:disabled) {
      background: $FUDMASTER-ORANGE;
      color: $white;
      border-color: $FUDMASTER-ORANGE;
      box-shadow: 0 2px 8px rgba($FUDMASTER-ORANGE, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      border-color: rgba($FUDMASTER-ORANGE, 0.1);
      color: rgba($FUDMASTER-ORANGE, 0.7);
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
  color: var(--text-muted);
  
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
  color: var(--text-muted);
  font-size: 24px;
  
  .secure-text {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    border-left: 1px solid var(--border-color);
    padding-left: 15px;
  }
}

.legal-text {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}


// DERECHA (TARJETA)
.order-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 40px -10px var(--shadow-color);
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
    color: var(--text-main);
    max-width: 60%;
  }
  
  .badge-lifetime {
    background: var(--text-main);
    color: var(--bg-card);
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
      color: var(--text-main);
      font-weight: 600;
      
      .amount {
        font-size: 32px;
        font-weight: 900;
        letter-spacing: -1px;
        color: var(--text-main);
      }
      .currency {
        font-size: 14px;
        vertical-align: middle;
        font-weight: 600;
        color: var(--text-muted);
      }
    }
    
    &.savings {
      font-size: 14px;
      
      .original {
        text-decoration: line-through;
        color: var(--text-muted);
      }
      
      .saved-amount {
        color: $FUDMASTER-PINK;
        font-weight: 800;
        background: var(--highlight-bg);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
    
    &.note {
      font-size: 13px;
      color: $FUDMASTER-GREEN;
      justify-content: flex-start;
      gap: 6px;
      font-weight: 600;
      margin-top: 4px;
    }
  }
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 24px 0;
}

.benefits-list {
  h4 {
    margin: 0 0 16px;
    font-size: 15px;
    color: var(--text-main);
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
    color: var(--text-muted);
    line-height: 1.4;
    
    i {
      color: $FUDMASTER-GREEN;
      margin-top: 2px;
    }
    
    strong {
      color: var(--text-main);
    }
  }
}

.mini-proof {
  text-align: center;
  margin-top: 20px;
  
  .stars {
    color: #FFC107;
    letter-spacing: 2px;
    font-size: 18px;
  }
  
  p {
    font-size: 12px;
    font-style: italic;
    color: var(--text-muted);
    margin: 4px 0 0;
  }
}
</style>
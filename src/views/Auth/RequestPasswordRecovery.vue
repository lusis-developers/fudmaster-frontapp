<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// State
const email = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

function goToLogin() {
  router.push('/login')
}

async function submit() {
  if (!email.value) return
  loading.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const response = await userStore.requestPasswordRecovery(email.value.trim())
    successMessage.value = response.message || 'Se ha enviado un correo con instrucciones.'
    // Optional: clear email or redirect after a delay
    // email.value = ''
  } catch (e: any) {
    // Handle error safely
    const msg = e.response?.data?.message || e.message || 'Ocurrió un error al procesar tu solicitud.'
    error.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="recovery-page">
    
    <div class="brand-header">
      <img src="/src/assets/fudmaster-color.png" alt="Fudmaster" class="logo" />
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="title">Recuperar Contraseña</h2>
        <p class="subtitle">Ingresa tu correo para recibir instrucciones</p>

        <div v-if="successMessage" class="alert success">
          <i class="fa-solid fa-circle-check" /> 
          <div>{{ successMessage }}</div>
        </div>
        
        <div v-if="error" class="alert error">
          <i class="fa-solid fa-circle-exclamation" /> 
          <div>{{ error }}</div>
        </div>

        <form class="form" @submit.prevent="submit" v-if="!successMessage">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <div class="input-wrapper">
              <i class="fa-regular fa-envelope icon" />
              <input 
                id="email" 
                type="email" 
                v-model.trim="email" 
                placeholder="ejemplo@correo.com" 
                autocomplete="email" 
                required
              />
            </div>
          </div>

          <button class="submit-btn" type="submit" :disabled="loading">
            <span v-if="!loading">Enviar Instrucciones <i class="fa-solid fa-paper-plane" /></span>
            <span v-else><i class="fa-solid fa-spinner fa-spin" /> Enviando...</span>
          </button>
        </form>

        <div v-else class="success-actions">
           <button class="submit-btn outline" type="button" @click="goToLogin">
            <i class="fa-solid fa-arrow-left" /> Volver al Login
          </button>
        </div>
      </div>

      <div class="card-footer" v-if="!successMessage">
        <span class="hint">¿Ya tienes cuenta?</span>
        <button class="link-btn" type="button" @click="goToLogin">
          Iniciar Sesión
        </button>
      </div>
    </div>
    
    <p class="copyright">© Füdmaster Inc. Sistema seguro.</p>
  </div>
</template>

<style lang="scss" scoped>
// Variables locales
$FUDMASTER-DARK: #010D27;
$FUDMASTER-LIGHT: #f5f3ef;
$FUDMASTER-GREEN: #2BBB92;
$FUDMASTER-BLUE: #0a81d1;
$white: #ffffff;
$alert-error: #ef4444;
$alert-success: #10b981;

.recovery-page { 
  width: 100%; 
  min-height: 100vh;
  padding: 40px 16px;
  background-color: $FUDMASTER-LIGHT;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.brand-header {
  text-align: center;
  .logo {
    height: 48px;
    width: auto;
  }
}

.card {
  width: 100%;
  max-width: 480px;
  background: $white;
  border-radius: 20px;
  box-shadow: 0 20px 40px -10px rgba($FUDMASTER-DARK, 0.1);
  overflow: hidden;
  border: 1px solid rgba($FUDMASTER-DARK, 0.05);
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-body {
  padding: 32px;
}

.title {
  color: $FUDMASTER-DARK;
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  text-align: center;
}

.subtitle {
  color: rgba($FUDMASTER-DARK, 0.6);
  font-size: 15px;
  margin: 8px 0 24px 0;
  text-align: center;
}

.alert {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  
  &.error {
    background: rgba($alert-error, 0.1);
    color: darken($alert-error, 10%);
    border: 1px solid rgba($alert-error, 0.2);
    i { color: $alert-error; }
  }
  
  &.success {
    background: rgba($alert-success, 0.1);
    color: darken($alert-success, 10%);
    border: 1px solid rgba($alert-success, 0.2);
    i { color: $alert-success; }
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  position: relative;
  
  .icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba($FUDMASTER-DARK, 0.4);
    pointer-events: none;
    transition: color 0.2s;
  }
  
  input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    border: 2px solid rgba($FUDMASTER-DARK, 0.1);
    border-radius: 12px;
    font-size: 15px;
    color: $FUDMASTER-DARK;
    background: $white;
    transition: all 0.2s ease;
    
    &::placeholder {
      color: rgba($FUDMASTER-DARK, 0.3);
    }
    
    &:focus {
      outline: none;
      border-color: $FUDMASTER-BLUE;
      box-shadow: 0 0 0 4px rgba($FUDMASTER-BLUE, 0.1);
      
      ~ .icon {
        color: $FUDMASTER-BLUE;
      }
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: $FUDMASTER-DARK;
  color: $white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: lighten($FUDMASTER-DARK, 5%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba($FUDMASTER-DARK, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.outline {
    background: transparent;
    color: $FUDMASTER-DARK;
    border: 2px solid rgba($FUDMASTER-DARK, 0.1);
    
    &:hover {
      border-color: $FUDMASTER-DARK;
      background: transparent;
    }
  }
}

.card-footer {
  background: rgba($FUDMASTER-DARK, 0.02);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgba($FUDMASTER-DARK, 0.05);
}

.hint {
  font-size: 13px;
  color: rgba($FUDMASTER-DARK, 0.5);
}

.link-btn {
  background: none;
  border: none;
  color: $FUDMASTER-BLUE;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
}

.copyright {
  font-size: 12px;
  color: rgba($FUDMASTER-DARK, 0.4);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 640px) {
  .card-footer {
    flex-direction: row;
    justify-content: center;
    gap: 6px;
  }
}
</style>

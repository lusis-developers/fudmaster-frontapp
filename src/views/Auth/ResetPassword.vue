<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// State
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

onMounted(() => {
  // Get token from query or params
  const queryToken = route.query.token as string
  const paramToken = route.params.token as string
  
  token.value = queryToken || paramToken || ''
  
  if (!token.value) {
    error.value = 'Token de recuperación no válido o faltante.'
  }
})

function togglePassword() {
  showPassword.value = !showPassword.value
}

function goToLogin() {
  router.push('/login')
}

async function submit() {
  const pwd = password.value.trim()
  const confirm = confirmPassword.value.trim()

  if (!pwd || !confirm) {
    error.value = 'Por favor completa todos los campos.'
    return
  }
  
  if (pwd !== confirm) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  
  if (pwd.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  
  if (!token.value) {
    error.value = 'Token inválido. Solicita un nuevo enlace.'
    return
  }

  loading.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const response = await userStore.resetPassword(token.value, pwd)
    successMessage.value = response.message || 'Contraseña restablecida exitosamente.'
    
    // Redirect to login after success
    setTimeout(() => {
      router.push('/login?msg=Contraseña actualizada. Inicia sesión.')
    }, 2000)
    
  } catch (e: any) {
    const msg = e.response?.data?.message || e.message || 'Error al restablecer contraseña.'
    error.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reset-page">
    
    <div class="brand-header">
      <img src="/src/assets/fudmaster-color.png" alt="Fudmaster" class="logo" />
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="title">Restablecer Contraseña</h2>
        <p class="subtitle">Crea una nueva contraseña segura</p>

        <div v-if="successMessage" class="alert success">
          <i class="fa-solid fa-circle-check" /> 
          <div>{{ successMessage }}</div>
        </div>
        
        <div v-if="error" class="alert error">
          <i class="fa-solid fa-circle-exclamation" /> 
          <div>{{ error }}</div>
        </div>

        <form class="form" @submit.prevent="submit" v-if="!successMessage">
          <!-- Password Input -->
          <div class="form-group">
            <label for="password">Nueva Contraseña</label>
            <div class="input-wrapper">
              <i class="fa-solid fa-lock icon" />
              <input 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Mínimo 6 caracteres" 
                autocomplete="new-password" 
                required
              />
              <button type="button" class="eye-btn" @click="togglePassword">
                <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" />
              </button>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <div class="input-wrapper">
              <i class="fa-solid fa-lock icon" />
              <input 
                id="confirmPassword" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="confirmPassword" 
                placeholder="Repite la contraseña" 
                autocomplete="new-password" 
                required
              />
            </div>
          </div>

          <button class="submit-btn" type="submit" :disabled="loading || !token">
            <span v-if="!loading">Cambiar Contraseña <i class="fa-solid fa-check" /></span>
            <span v-else><i class="fa-solid fa-spinner fa-spin" /> Procesando...</span>
          </button>
        </form>

        <div v-else class="success-actions">
           <button class="submit-btn outline" type="button" @click="goToLogin">
            <i class="fa-solid fa-arrow-right-to-bracket" /> Ir al Login
          </button>
        </div>
      </div>

      <div class="card-footer" v-if="!successMessage">
        <button class="link-btn" type="button" @click="goToLogin">
          Cancelar y volver al Login
        </button>
      </div>
    </div>
    
    <p class="copyright">© Füdmaster Inc. Sistema seguro.</p>
  </div>
</template>

<style lang="scss" scoped>
// Reutilizando variables y estilos base para consistencia
$FUDMASTER-DARK: #010D27;
$FUDMASTER-LIGHT: #f5f3ef;
$FUDMASTER-GREEN: #2BBB92;
$FUDMASTER-BLUE: #0a81d1;
$white: #ffffff;
$alert-error: #ef4444;
$alert-success: #10b981;

.reset-page { 
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
    padding: 14px 44px 14px 44px; // Extra padding on right for eye button
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

  .eye-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba($FUDMASTER-DARK, 0.5);
    cursor: pointer;
    padding: 4px;
    
    &:hover {
      color: $FUDMASTER-DARK;
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
  justify-content: center;
  border-top: 1px solid rgba($FUDMASTER-DARK, 0.05);
}

.link-btn {
  background: none;
  border: none;
  color: rgba($FUDMASTER-DARK, 0.6);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: $FUDMASTER-DARK;
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
</style>

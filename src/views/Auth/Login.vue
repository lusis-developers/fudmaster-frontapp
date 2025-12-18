<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import usersService, { type LoginBody, type LoginResponse } from '@/services/users.service'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// State
const email = ref(String(route.query.email || ''))
const password = ref('')
const showPassword = ref(false) // Nuevo: Toggle password
const loading = ref(false)
const error = ref('')
const info = ref(String(route.query.msg || ''))

function goToCheckout() {
  router.push('/checkout')
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function submit() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = ''
  
  try {
    const body: LoginBody = { email: email.value.trim(), password: password.value.trim() }
    const { data } = await usersService.login<LoginResponse>(body)
    
    localStorage.setItem('access_token', data.token)
    try {
      const uid = (data.user as any)?.id || (data.user as any)?._id || (data.user as any)?.user_id
      const name = (data.user as any)?.name || null
      const emailVal = (data.user as any)?.email || null
      if (uid) localStorage.setItem('user_id', String(uid))
      userStore.setUser({ id: uid, name, email: emailVal })
    } catch {}
    
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Credenciales incorrectas. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    
    <div class="brand-header">
      <img src="/src/assets/fudmaster-color.png" alt="Fudmaster" class="logo" />
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="title">Bienvenido de nuevo</h2>
        <p class="subtitle">Ingresa a tu panel de control</p>

        <div v-if="info" class="alert info">
          <i class="fa-solid fa-circle-info" /> {{ info }}
        </div>
        
        <div v-if="error" class="alert error">
          <i class="fa-solid fa-circle-exclamation" /> {{ error }}
        </div>

        <form class="form" @submit.prevent="submit">
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

          <div class="form-group">
            <div class="label-row">
              <label for="password">Contraseña</label>
              <router-link to="/request-password-recovery" class="forgot-link">¿Olvidaste tu contraseña?</router-link>
            </div>
            <div class="input-wrapper">
              <i class="fa-solid fa-lock icon" />
              <input 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="••••••••" 
                autocomplete="current-password" 
                required
              />
              <button type="button" class="eye-btn" @click="togglePassword">
                <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" />
              </button>
            </div>
          </div>

          <button class="submit-btn" type="submit" :disabled="loading">
            <span v-if="!loading">Iniciar Sesión <i class="fa-solid fa-arrow-right-to-bracket" /></span>
            <span v-else><i class="fa-solid fa-spinner fa-spin" /> Verificando...</span>
          </button>
        </form>
      </div>

      <div class="card-footer">
        <span class="hint">¿Aún no eres miembro Founder?</span>
        <button class="buy-btn" type="button" @click="goToCheckout">
          Obtener Acceso de por Vida
        </button>
      </div>
    </div>
    
    <p class="copyright">© Füdmaster Inc. Sistema seguro.</p>
  </div>
</template>

<style lang="scss" scoped>
// Variables locales (asumiendo que las globales están disponibles, pero por seguridad)
$FUDMASTER-DARK: #010D27;
$FUDMASTER-LIGHT: #f5f3ef;
$FUDMASTER-GREEN: #2BBB92;
$FUDMASTER-BLUE: #0a81d1;
$white: #ffffff;
$alert-error: #ef4444;
$alert-info: #3b82f6;

.login-page { 
  width: 100%; 
  min-height: 100vh;
  padding: 40px 16px;
  background-color: $FUDMASTER-LIGHT; // Fondo de página claro
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
  overflow: hidden; // Para que el footer no se salga
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
    color: $alert-error;
    border: 1px solid rgba($alert-error, 0.2);
  }
  
  &.info {
    background: rgba($alert-info, 0.1);
    color: $alert-info;
    border: 1px solid rgba($alert-info, 0.2);
  }
}

.form { display: grid; gap: 20px; }

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

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  color: $FUDMASTER-BLUE;
  text-decoration: none;
  font-weight: 500;
  
  &:hover { text-decoration: underline; }
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba($FUDMASTER-DARK, 0.03);
  border: 1px solid rgba($FUDMASTER-DARK, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  
  &:focus-within {
    background: $white;
    border-color: $FUDMASTER-BLUE;
    box-shadow: 0 0 0 4px rgba($FUDMASTER-BLUE, 0.1);
  }
  
  .icon {
    color: rgba($FUDMASTER-DARK, 0.5);
    font-size: 18px;
  }
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 16px;
    color: $FUDMASTER-DARK;
    
    &::placeholder { color: rgba($FUDMASTER-DARK, 0.3); }
  }
  
  .eye-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: rgba($FUDMASTER-DARK, 0.4);
    transition: color 0.2s;
    
    &:hover { color: $FUDMASTER-DARK; }
  }
}

.submit-btn {
  margin-top: 10px;
  width: 100%;
  background: $FUDMASTER-DARK; // Color solido oscuro para login
  color: $white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba($FUDMASTER-DARK, 0.3);
  }
  
  &:disabled { opacity: 0.7; cursor: not-allowed; }
}

// Footer seccion (Upsell)
.card-footer {
  background: rgba($FUDMASTER-DARK, 0.03);
  padding: 20px 32px;
  border-top: 1px solid rgba($FUDMASTER-DARK, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  
  .hint {
    font-size: 14px;
    color: rgba($FUDMASTER-DARK, 0.6);
  }
  
  .buy-btn {
    background: transparent;
    border: 2px solid $FUDMASTER-GREEN; // Borde verde para llamar atención sin ser agresivo
    color: $FUDMASTER-GREEN;
    font-weight: 700;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    
    &:hover {
      background: $FUDMASTER-GREEN;
      color: $white;
    }
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
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import usersService, { type LoginBody, type LoginResponse } from '@/services/users.service'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

function goToCheckout() {
  router.push('/checkout')
}

async function submit() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = ''
  try {
    const body: LoginBody = { email: email.value.trim(), password: password.value }
    const { data } = await usersService.login<LoginResponse>(body)
    localStorage.setItem('access_token', data.token)
    try {
      const uid = (data.user as any)?.id || (data.user as any)?._id || (data.user as any)?.user_id
      const name = (data.user as any)?.name || null
      const emailVal = (data.user as any)?.email || null
      if (uid) {
        localStorage.setItem('user_id', String(uid))
      }
      userStore.setUser({ id: uid, name, email: emailVal })
    } catch {}
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <h2 class="title"><i class="fa-solid fa-right-to-bracket" /> Iniciar sesión</h2>
      <form class="form" @submit.prevent="submit">
        <label for="email" class="label">Correo electrónico</label>
        <div class="input">
          <i class="fa-regular fa-envelope" />
          <input id="email" type="email" v-model.trim="email" placeholder="tu@correo.com" autocomplete="email" />
        </div>

        <label for="password" class="label">Contraseña</label>
        <div class="input">
          <i class="fa-solid fa-lock" />
          <input id="password" type="password" v-model="password" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <div v-if="error" class="error"><i class="fa-solid fa-triangle-exclamation" /> {{ error }}</div>

        <button class="submit" type="submit" :disabled="loading">
          <span v-if="!loading">Entrar</span>
          <span v-else><i class="fa-solid fa-spinner fa-spin" /> Procesando...</span>
        </button>
      </form>
      <div class="alt-cta">
        <span class="hint">¿Aún no tienes acceso?</span>
        <button class="buy" type="button" @click="goToCheckout">
          <i class="fa-solid fa-bag-shopping" /> Comprar servicio exclusivo ahora
        </button>
      </div>
    </div>
  </div>
  </template>

<style lang="scss" scoped>
.login-page { width: 100%; padding: 24px 16px; }
.card {
  width: 100%;
  max-width: 560px;
  background: $white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  margin: 0 auto;
}
.title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $FUDMASTER-DARK;
  font-size: 24px;
  margin: 0 0 16px 0;
}
.form { display: grid; gap: 16px; }
.label { font-size: 14px; color: #555; }
.input {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 14px 16px;
  background: $FUDMASTER-LIGHT;
}
.input i { color: $FUDMASTER-DARK; }
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
  padding: 12px 14px;
  font-size: 14px;
}
.submit {
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
.alt-cta { display: grid; gap: 8px; margin-top: 12px; }
.hint { color: #777; font-size: 12px; }
.buy {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: $FUDMASTER-BLUE;
  color: $white;
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
}
</style>

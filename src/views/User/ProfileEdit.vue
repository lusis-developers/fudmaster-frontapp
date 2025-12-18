<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { type UpdateUserBody, type UpdateUserResponse, type Gender, type HeardAboutUs, type GetUserResponse, type SafeUser } from '@/services/users.service'
import usersService from '@/services/users.service'
import UpgradeBanner from '@/components/UpgradeBanner.vue'

const router = useRouter()
const userStore = useUserStore()
userStore.hydrate()

const genderOptions: Array<{ label: string; value: Gender }> = [
  { label: 'Prefiero no decir', value: 'prefer_not_to_say' },
  { label: 'Femenino', value: 'female' },
  { label: 'Masculino', value: 'male' },
  { label: 'Otro', value: 'other' },
]

const heardOptions: Array<{ label: string; value: HeardAboutUs }> = [
  { label: 'Anuncio en redes', value: 'social_media_ad' },
  { label: 'Amigo o colega', value: 'friend_colleague' },
  { label: 'Buscador', value: 'search_engine' },
  { label: 'Artículo o blog', value: 'online_article_blog' },
  { label: 'YouTube', value: 'youtube_video' },
  { label: 'Podcast', value: 'podcast' },
  { label: 'Evento o webinar', value: 'event_webinar' },
  { label: 'Campaña de email', value: 'email_campaign' },
  { label: 'Teachable Marketplace', value: 'teachable_marketplace' },
  { label: 'Otro', value: 'other' },
]

type FormState = {
  name: string
  email: string
  gender: Gender | null
  genderOther: string | null
  dateOfBirth: string | null
  heardAboutUs: HeardAboutUs | null
  heardAboutUsOther: string | null
}

const name = ref<string>(userStore.name || '')
const email = ref<string>(userStore.email || '')
const gender = ref<Gender | null>(userStore.gender ?? null)
const genderOther = ref<string | null>(userStore.genderOther ?? null)
const dateOfBirth = ref<string | null>(userStore.dateOfBirth ?? null)
const heardAboutUs = ref<HeardAboutUs | null>(userStore.heardAboutUs ?? null)
const heardAboutUsOther = ref<string | null>(userStore.heardAboutUsOther ?? null)
const initialForm = ref<FormState | null>(null)
const initialized = ref(false)

const loading = ref(false)
const error = ref('')
const success = ref('')
const passLoading = ref(false)
const passError = ref('')
const passSuccess = ref('')
const passBlocked = ref(false)

const showGenderOther = computed(() => gender.value === 'other')
const showHeardOther = computed(() => heardAboutUs.value === 'other')

function toMessage(e: unknown): string {
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e) {
    const m = (e as { message?: unknown }).message
    return typeof m === 'string' ? m : 'Error'
  }
  return 'Error'
}

onMounted(async () => {
  if (!userStore.id) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await usersService.getById<GetUserResponse>(String(userStore.id))
    const u: SafeUser = data.user
    userStore.setUser({ id: u._id, name: u.name, email: u.email, teachableUserId: u.teachableUserId })
    userStore.gender = u.gender
    userStore.genderOther = u.genderOther
    userStore.dateOfBirth = u.dateOfBirth
    userStore.heardAboutUs = u.heardAboutUs
    userStore.heardAboutUsOther = u.heardAboutUsOther
    userStore.points = u.points
    name.value = u.name
    email.value = u.email
    gender.value = u.gender
    genderOther.value = u.genderOther
    dateOfBirth.value = u.dateOfBirth
    heardAboutUs.value = u.heardAboutUs
    heardAboutUsOther.value = u.heardAboutUsOther
    initialForm.value = {
      name: u.name,
      email: u.email,
      gender: u.gender,
      genderOther: u.genderOther,
      dateOfBirth: u.dateOfBirth,
      heardAboutUs: u.heardAboutUs,
      heardAboutUsOther: u.heardAboutUsOther,
    }
    initialized.value = true
  } catch (e) {
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
})

const isDirty = computed(() => {
  const init = initialForm.value
  if (!init) return false
  return (
    init.name !== name.value ||
    init.email !== email.value ||
    init.gender !== gender.value ||
    init.genderOther !== genderOther.value ||
    init.dateOfBirth !== dateOfBirth.value ||
    init.heardAboutUs !== heardAboutUs.value ||
    init.heardAboutUsOther !== heardAboutUsOther.value
  )
})

async function submit() {
  error.value = ''
  success.value = ''
  if (!userStore.id) { error.value = 'Usuario no identificado'; return }
  if (!name.value || !email.value) { error.value = 'Nombre y email son requeridos'; return }
  const body: UpdateUserBody = {
    name: name.value.trim(),
    email: email.value.trim(),
    gender: gender.value ?? undefined,
    genderOther: showGenderOther.value ? (genderOther.value?.trim() || null) : null,
    dateOfBirth: dateOfBirth.value ? String(dateOfBirth.value) : null,
    heardAboutUs: heardAboutUs.value ?? undefined,
    heardAboutUsOther: showHeardOther.value ? (heardAboutUsOther.value?.trim() || null) : null,
  }
  loading.value = true
  try {
    const res: UpdateUserResponse = await userStore.updateById(String(userStore.id), body)
    success.value = res.message || 'Perfil actualizado'
    if (initialForm.value) {
      initialForm.value = {
        name: name.value,
        email: email.value,
        gender: gender.value,
        genderOther: genderOther.value,
        dateOfBirth: dateOfBirth.value,
        heardAboutUs: heardAboutUs.value,
        heardAboutUsOther: heardAboutUsOther.value,
      }
    }
  } catch (e) {
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
}

function goBack() { router.back() }

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordValid = computed(() => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) return false
  if (newPassword.value.length < 8) return false
  if (newPassword.value === currentPassword.value) return false
  if (newPassword.value !== confirmPassword.value) return false
  return true
})

async function changePassword() {
  passError.value = ''
  passSuccess.value = ''
  if (!userStore.id) { passError.value = 'Usuario no identificado'; return }
  if (!passwordValid.value) { passError.value = 'Revisa los campos'; return }
  passLoading.value = true
  try {
    const res = await userStore.changePassword(String(userStore.id), { currentPassword: currentPassword.value, newPassword: newPassword.value })
    passSuccess.value = res.message || 'Contraseña actualizada'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    const isObj = (v: unknown): v is { status?: number; message?: string } => typeof v === 'object' && v !== null
    if (isObj(e) && (e as { status?: number }).status === 401) {
      passError.value = 'La contraseña actual no es correcta.'
      passBlocked.value = true
    } else {
      passError.value = toMessage(e)
    }
  } finally {
    passLoading.value = false
  }
}

watch(currentPassword, () => {
  if (passBlocked.value) { passBlocked.value = false; passError.value = '' }
})
</script>

<template>
  <div class="wrapper">
    <div class="head">
      <h2>Editar perfil</h2>
      <button class="btn ghost" type="button" @click="goBack" :disabled="loading">Volver</button>
    </div>

    <div v-if="loading && !initialized" class="loading-pane">
      <div class="spinner" aria-label="Cargando"></div>
    </div>

    <form v-else class="form" @submit.prevent="submit">
      <div class="field">
        <label>Nombre</label>
        <input type="text" v-model="name" placeholder="Tu nombre" />
      </div>

      <div class="field">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="tu@email.com" />
      </div>

      <div class="field">
        <label>Género</label>
        <select v-model="gender">
          <option :value="null">Sin especificar</option>
          <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="field" v-if="showGenderOther">
        <label>Otro género</label>
        <input type="text" v-model="genderOther" placeholder="Especifica" />
      </div>

      <div class="field">
        <label>Fecha de nacimiento</label>
        <input type="date" v-model="dateOfBirth" />
      </div>

      <div class="field">
        <label>¿Cómo nos conociste?</label>
        <select v-model="heardAboutUs">
          <option :value="null">Sin especificar</option>
          <option v-for="opt in heardOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="field" v-if="showHeardOther">
        <label>Otro</label>
        <input type="text" v-model="heardAboutUsOther" placeholder="Especifica" />
      </div>

      <div class="actions">
        <button class="btn primary" type="submit" :disabled="!initialized || loading || !isDirty">Guardar</button>
        <span class="loading" v-if="loading">Guardando...</span>
        <span class="error" v-if="error">{{ error }}</span>
        <span class="success" v-if="success">{{ success }}</span>
      </div>
    </form>

    <div style="margin: 20px 0;">
      <UpgradeBanner />
    </div>

    <div class="divider"></div>
    <form class="form" @submit.prevent="changePassword">
      <div class="field">
        <label>Contraseña actual</label>
        <input type="password" v-model="currentPassword" placeholder="Tu contraseña actual" :disabled="passLoading || passBlocked" />
        <p v-if="passBlocked" class="hint error">La contraseña actual no coincide. Vuelve a intentarlo.</p>
      </div>
      <div class="field">
        <label>Nueva contraseña</label>
        <input type="password" v-model="newPassword" placeholder="Mínimo 8 caracteres" :disabled="passLoading || passBlocked" />
      </div>
      <div class="field">
        <label>Confirmar nueva contraseña</label>
        <input type="password" v-model="confirmPassword" placeholder="Repite la nueva contraseña" :disabled="passLoading || passBlocked" />
      </div>
      <div class="actions">
        <button class="btn primary" type="submit" :disabled="passBlocked || passLoading || !passwordValid">Actualizar contraseña</button>
        <span class="loading" v-if="passLoading">Actualizando...</span>
        <span class="error" v-if="passError">{{ passError }}</span>
        <span class="success" v-if="passSuccess">{{ passSuccess }}</span>
      </div>
    </form>
  </div>
  </template>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  max-width: 720px;
  padding: 16px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
}

label {
  color: var(--text);
  font-size: 14px;
}

input,
select {
  background: color-mix(in oklab, var(--text), transparent 94%);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

input::placeholder {
  color: color-mix(in oklab, var(--text), transparent 50%);
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

.btn.primary {
  background: var(--accent);
  color: $white;
}

.btn.ghost {
  background: color-mix(in oklab, var(--text), transparent 94%);
  color: var(--text);
  border: 1px solid var(--border);
}

.loading,
.error,
.success {
  font-size: 13px;
}

.error {
  color: $alert-error;
}

.success { color: $alert-success; }
.divider { height: 1px; background: var(--border); margin: 16px 0; }
.hint { font-size: 12px; }

.loading-pane {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid color-mix(in oklab, var(--text), transparent 80%);
  border-top-color: var(--accent);
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 768px) {
  .form {
    grid-template-columns: 1fr 1fr;
  }

  .actions {
    grid-column: 1 / -1;
  }
}
</style>

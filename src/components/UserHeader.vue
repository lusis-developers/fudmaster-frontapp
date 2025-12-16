<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import usersService from '@/services/users.service'
import gamificationService from '@/services/gamification.service'
import { useUserStore } from '@/stores/user'
import lightLogo from '../assets/fudmaster-color.png'
import darkLogo from '../assets/fudmaster-dark.png'

const props = defineProps({
  showMenuButton: {
    type: Boolean,
    required: false,
  },
})

const emit = defineEmits(['toggleSidebar'])

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = ref(!!localStorage.getItem('access_token'))
const route = useRoute()

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  const uid = userStore.id
  return typeof uid === 'number' ? String(uid) : (uid || '')
})

const isDarkTheme = ref(false)
let themeObserver: MutationObserver | null = null
function updateThemeFlag() { isDarkTheme.value = document.documentElement.getAttribute('data-theme') === 'dark' }
const logoSrc = computed(() => (isDarkTheme.value ? darkLogo : lightLogo))

const points = ref<number | null>(null)
const pointsLoading = ref(false)
const pointsError = ref('')

function onLogoClick() {
  // Navigation logic can be added here if needed
  router.push('/')
}

async function fetchPoints() {
  if (!isLoggedIn.value || !userId.value) { points.value = null; return }
  pointsLoading.value = true
  pointsError.value = ''
  try {
    const { data, headers } = await gamificationService.getUserPoints(userId.value)
    const headerVal = Number((headers as any)['x-user-points'] || (headers as any)['X-User-Points'] || NaN)
    const bodyVal = Number((data as any)?.points ?? NaN)
    const final = Number.isFinite(headerVal) ? headerVal : (Number.isFinite(bodyVal) ? bodyVal : 0)
    points.value = final
  } catch (e: any) {
    pointsError.value = e?.message || 'Error al obtener puntos'
    points.value = null
  } finally {
    pointsLoading.value = false
  }
}

function handleMenuClick() {
  emit('toggleSidebar')
}

function navigateToLogin() {
  router.push('/login')
}


function onTokenExpired() {
  localStorage.removeItem('access_token')
  isLoggedIn.value = false
  router.push('/login')
}

async function logout() {
  await usersService.logout()
  isLoggedIn.value = false
}

function confirmLogout() {
  window.dispatchEvent(new CustomEvent('app:confirm', {
    detail: {
      title: 'Cerrar sesión',
      message: '¿Estás seguro que quieres cerrar sesión?',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      onConfirm: async () => { await logout() }
    }
  }))
}

onMounted(() => {
  window.addEventListener('auth:token-expired', onTokenExpired as EventListener)
  fetchPoints()
  window.addEventListener('gamification:points-refresh', fetchPoints as EventListener)
  window.addEventListener('comments:created', fetchPoints as EventListener)
  updateThemeFlag()
  themeObserver = new MutationObserver(updateThemeFlag)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  window.removeEventListener('auth:token-expired', onTokenExpired as EventListener)
  window.removeEventListener('gamification:points-refresh', fetchPoints as EventListener)
  window.removeEventListener('comments:created', fetchPoints as EventListener)
  try { themeObserver?.disconnect() } catch {}
})

watch(isLoggedIn, (val) => { if (val) fetchPoints(); else points.value = null })
</script>

<template>
  <header class="user-header">
    <div class="user-header-wrapper">
      <div class="user-header-wrapper-left">
        <button v-if="props.showMenuButton !== false" class="menu-button" @click="handleMenuClick">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="logo">
          <picture>
            <source srcset="../assets/iso-verde.png" media="(max-width: 768px)">
            <img :src="logoSrc" alt="fudmaster-logo" @click="onLogoClick">
          </picture>
        </div>
      </div>
      <div class="user-header-wrapper-right">
        <template v-if="isLoggedIn">
          <div class="user-pill" title="Sesión iniciada">
            <i class="fa-solid fa-user"></i>
            <span class="account-text">Mi cuenta</span>
            <span v-if="pointsLoading" class="points-chip loading"><i class="fa-solid fa-spinner fa-spin"></i></span>
            <span v-else-if="points !== null" class="points-chip"><i class="fa-solid fa-trophy"></i> {{ points }}</span>
          </div>
          <button class="logout-button" @click="confirmLogout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span class="logout-text">Cerrar sesión</span>
          </button>
        </template>
        <button v-else-if="route.path !== '/login' && route.path !== '/checkout'" class="login-button" @click="navigateToLogin">
          <i class="fa-solid fa-right-to-bracket"></i>
          Iniciar sesión
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.user {
  &-header {
    background-color: var(--bg);
    color: var(--text);
    padding: 16px;
    border-bottom: 1px solid var(--border);

    &-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      &-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .menu-button {
          background: none;
          border: none;
          color: var(--text);
          font-size: 24px;
          cursor: pointer;

          &:hover {
            color: var(--accent);
          }
        }

        .logo {
          width: 120px;

          img {
            width: 100%;
            cursor: pointer;
          }
        }
      }

      &-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .login-button {
          background: $FUDMASTER-GREEN;
          color: $white;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;

          &:hover {
            filter: brightness(0.95);
          }
        }

        .user-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .points-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent);
          color: $white;
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 12px;
          margin-left: 6px;
        }

        .points-chip.loading {
          background: transparent;
          color: var(--text);
          border: 1px dashed var(--border);
        }

        .logout-button {
          background: $FUDMASTER-DARK;
          color: $white;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;

          &:hover {
            filter: brightness(0.95);
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .user-header-wrapper-left .menu-button {
    display: none;
  }

  .user-header .logo {
    width: 88px;
  }

  .user-header-wrapper-right .user-pill {
    padding: 6px 10px;
  }

  .user-header-wrapper-right .user-pill .account-text {
    display: none;
  }

  .user-header-wrapper-right .logout-button {
    padding: 8px;
    border-radius: 999px;
  }

  .user-header-wrapper-right .logout-button .logout-text {
    display: none;
  }
}
</style>

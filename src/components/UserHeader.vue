<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import usersService from '@/services/users.service'
import { useUserStore } from '@/stores/user'
import { useGamificationStore } from '@/stores/gamification.store'
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
const gamificationStore = useGamificationStore()
const isLoggedIn = ref(!!localStorage.getItem('access_token'))
const route = useRoute()

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  const uid = userStore.id
  return typeof uid === 'number' ? String(uid) : (uid || '')
})

const isFreeUser = computed(() => {
  // Asumimos que si no hay plan, es free por defecto o estamos cargando.
  // Pero si ya está logueado y el plan es 'free', mostramos el banner.
  if (!userStore.id) userStore.hydrate()
  return userStore.accountType === 'free'
})

const isDarkTheme = ref(false)
let themeObserver: MutationObserver | null = null
function updateThemeFlag() { isDarkTheme.value = document.documentElement.getAttribute('data-theme') === 'dark' }
const logoSrc = computed(() => (isDarkTheme.value ? darkLogo : lightLogo))

const points = computed(() => gamificationStore.points)
const pointsLoading = computed(() => gamificationStore.loading)

const pointsAnimating = ref(false)
watch(points, (newVal, oldVal) => {
  if (newVal !== null && oldVal !== null && newVal > oldVal) {
    pointsAnimating.value = true
    setTimeout(() => { pointsAnimating.value = false }, 1000)
  }
})

function onLogoClick() {
  // Navigation logic can be added here if needed
  router.push('/')
}

async function fetchPoints() {
  if (!isLoggedIn.value || !userId.value) { gamificationStore.reset(); return }
  await gamificationStore.fetchPoints(userId.value)
}

function handleMenuClick() {
  emit('toggleSidebar')
}

function navigateToLogin() {
  router.push('/login')
}

function goToCheckout() {
  router.push('/checkout')
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

watch(isLoggedIn, (val) => { if (val) fetchPoints(); else gamificationStore.reset() })
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
          <!-- CTA para usuarios FREE -->
          <button v-if="isFreeUser" class="upgrade-btn" @click="goToCheckout">
            <i class="fa-solid fa-crown" />
            <span>Hazte Founder</span>
          </button>

          <div class="user-pill" title="Sesión iniciada">
            <i class="fa-solid fa-user"></i>
            <span class="account-text">Mi cuenta</span>
            <span v-if="pointsLoading" class="points-chip loading"><i class="fa-solid fa-spinner fa-spin"></i></span>
            <span v-else-if="points !== null" class="points-chip" :class="{ animating: pointsAnimating }"><i class="fa-solid fa-trophy"></i> {{ points }}</span>
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

        .upgrade-btn {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          border: none;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-right: 8px;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 165, 0, 0.4);
          }
          
          i { font-size: 14px; }
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

        .points-chip.animating {
          animation: points-gain 1s ease-out;
        }

        @keyframes points-gain {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); background: $FUDMASTER-GREEN; }
          100% { transform: scale(1); }
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

  .user-header-wrapper-right .upgrade-btn span {
    display: none;
  }
  .user-header-wrapper-right .upgrade-btn {
    padding: 8px;
    border-radius: 50%;
  }
}
</style>

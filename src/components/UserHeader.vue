<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  showMenuButton: {
    type: Boolean,
    required: false,
  },
})

const emit = defineEmits(['toggleSidebar'])

const router = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('access_token'))
const route = useRoute()

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

onMounted(() => {
  window.addEventListener('auth:token-expired', onTokenExpired as EventListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('auth:token-expired', onTokenExpired as EventListener)
})
</script>

<template>
  <header class="user-header">
    <div class="user-header-wrapper">
      <div class="user-header-wrapper-left">
        <button v-if="props.showMenuButton !== false" class="menu-button" @click="handleMenuClick">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="logo">
          <img src="../assets/fudmaster-color.png" alt="fudmaster-logo">
        </div>
      </div>
      <div class="user-header-wrapper-right">
        <div v-if="isLoggedIn" class="user-pill" title="Sesión iniciada">
          <i class="fa-solid fa-user"></i>
          Mi cuenta
        </div>
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
      background-color: $FUDMASTER-LIGHT;
      color: white;
      padding: 16px;
      // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid #e0e0e0;

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
            color: $FUDMASTER-DARK;
            font-size: 24px;
            cursor: pointer;

            &:hover {
              color: $FUDMASTER-GREEN;
            }
          }
          
          .logo {
            width: 120px;
            img {
              width: 100%;
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

            &:hover { filter: brightness(0.95); }
          }

          .user-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: $white;
            color: $FUDMASTER-DARK;
            border: 1px solid #e0e0e0;
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 14px;
            font-weight: 600;
          }
        }
      }
    }
  }
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import lightLogo from '../assets/fudmaster-color.png'
import darkLogo from '../assets/fudmaster-dark.png'
import ExitIntentModal from './ExitIntentModal.vue'

const router = useRouter()
const route = useRoute()

// Theme logic
const isDarkTheme = ref(false)
let themeObserver: MutationObserver | null = null
function updateThemeFlag() { isDarkTheme.value = document.documentElement.getAttribute('data-theme') === 'dark' }
const logoSrc = computed(() => (isDarkTheme.value ? darkLogo : lightLogo))

// Exit Intent Logic (Mainly for Checkout)
const exitOpen = ref(false)
const isMobileMenuOpen = ref(false)
function toggleMobileMenu() { isMobileMenuOpen.value = !isMobileMenuOpen.value }
function closeMobileMenu() { isMobileMenuOpen.value = false }
function onLogoClick() {
  if (route.path === '/checkout') {
    exitOpen.value = true
  } else {
    router.push('/landing-page')
  }
}
function stayOnCheckout() { exitOpen.value = false }
function goToLanding() { exitOpen.value = false; router.push('/landing-page') }

function goToVerify() {
  router.push('/verify-certificate')
}

function goToLogin() {
  router.push('/login')
}

onMounted(() => {
  updateThemeFlag()
  themeObserver = new MutationObserver(updateThemeFlag)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  try { themeObserver?.disconnect() } catch {}
})
</script>

<template>
  <header class="public-header">
    <div class="public-header-wrapper">
      <div class="public-header-wrapper-left">
        <div class="logo">
          <picture>
            <source srcset="../assets/iso-verde.png" media="(max-width: 768px)">
            <img :src="logoSrc" alt="fudmaster-logo" @click="onLogoClick">
          </picture>
        </div>
      </div>
      <div class="public-header-wrapper-right">
        <!-- Desktop Buttons -->
        <div class="desktop-menu">
          <button class="promo-button" @click="goToLanding">
            <i class="fa-solid fa-fire"></i>
            <span>Aprovechar Promoción</span>
          </button>
          <button 
            class="verify-button" 
            :class="{ 'active': route.path === '/verify-certificate' }"
            @click="goToVerify"
          >
            <i class="fa-solid fa-certificate"></i>
            <span>Verificar Certificado</span>
          </button>
          <button v-if="route.path !== '/login'" class="login-button" @click="goToLogin">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Iniciar sesión</span>
          </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" @click="toggleMobileMenu">
          <i :class="isMobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Sidebar Menu -->
  <div class="mobile-menu-overlay" :class="{ 'active': isMobileMenuOpen }" @click="closeMobileMenu"></div>
  <aside class="mobile-sidebar" :class="{ 'active': isMobileMenuOpen }">
    <div class="mobile-sidebar-header">
      <img :src="logoSrc" alt="Fudmaster" class="mobile-logo">
      <button class="close-button" @click="closeMobileMenu">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    
    <nav class="mobile-nav">
      <button class="mobile-nav-item promo" @click="goToLanding(); closeMobileMenu()">
        <i class="fa-solid fa-fire"></i>
        <span>Aprovechar Promoción</span>
      </button>
      
      <button 
        class="mobile-nav-item" 
        :class="{ 'active': route.path === '/verify-certificate' }"
        @click="goToVerify(); closeMobileMenu()"
      >
        <i class="fa-solid fa-certificate"></i>
        <span>Verificar Certificado</span>
      </button>
      
      <button 
        v-if="route.path !== '/login'" 
        class="mobile-nav-item" 
        @click="goToLogin(); closeMobileMenu()"
      >
        <i class="fa-solid fa-right-to-bracket"></i>
        <span>Iniciar sesión</span>
      </button>
    </nav>
  </aside>

  <ExitIntentModal
    v-if="route.path === '/checkout'"
    :open="exitOpen"
    message="Estás a un paso de asegurar tu acceso. Si sales de esta página ahora, el sistema liberará tu cupo y no podemos garantizarte el precio de $297 cuando regreses."
    @close="stayOnCheckout"
    @stay="stayOnCheckout"
    @leave="goToLanding"
  />
</template>

<style lang="scss" scoped>
.public {
  &-header {
    background-color: var(--bg);
    color: var(--text);
    padding: 16px;
    border-bottom: 1px solid var(--border);
    position: relative;
    z-index: 50;

    &-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
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

        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-toggle {
          display: none; // Hidden by default on desktop
          background: transparent;
          border: none;
          font-size: 24px;
          color: var(--text);
          cursor: pointer;
          padding: 4px;
          
          &:hover {
            color: var(--accent);
          }
        }

        .promo-button {
          background: var(--accent);
          color: $white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px color-mix(in oklab, var(--accent), transparent 70%);

          &:hover {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }
        }

        .verify-button {
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;

          &:hover {
            background: var(--bg-hover, #f5f5f5);
            border-color: var(--accent);
            color: var(--accent);
          }

          &.active {
            background: color-mix(in oklab, var(--accent), transparent 90%);
            border-color: var(--accent);
            color: var(--accent);
            cursor: default;
          }
        }

        .login-button {
          background: transparent;
          color: var(--text);
          border: none;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;

          &:hover {
            color: var(--accent);
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .public-header .logo {
    width: 88px;
  }
}

// Mobile Menu Styles
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);

  &.active {
    opacity: 1;
    visibility: visible;
  }
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  right: -280px; // Hide off-screen
  width: 280px;
  height: 100vh;
  background: var(--bg);
  z-index: 100;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-left: 1px solid var(--border);

  &.active {
    transform: translateX(-280px);
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    .mobile-logo {
      width: 100px;
      height: auto;
    }

    .close-button {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text);
      cursor: pointer;
      padding: 4px;
      
      &:hover {
        color: var(--accent);
      }
    }
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 12px;
      color: var(--text);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      width: 100%;

      i {
        font-size: 18px;
        width: 24px;
        text-align: center;
      }

      &:hover, &.active {
        background: var(--bg-hover, #f5f5f5);
        color: var(--accent);
      }

      &.active {
        background: color-mix(in oklab, var(--accent), transparent 90%);
        border-color: var(--accent);
        font-weight: 600;
      }

      &.promo {
        background: var(--accent);
        color: $white;
        font-weight: 700;
        box-shadow: 0 4px 12px color-mix(in oklab, var(--accent), transparent 70%);
        margin-bottom: 8px;

        &:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .public-header-wrapper-right {
    .desktop-menu {
      display: none; // Hide desktop menu on mobile
    }
    
    .mobile-toggle {
      display: block; // Show toggle button
    }
  }
}
</style>

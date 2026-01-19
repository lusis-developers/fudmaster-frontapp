<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import UserSidebar from '../components/UserSidebar.vue';
import UserHeader from '../components/UserHeader.vue';
import OnboardingModal from '../components/User/OnboardingModal.vue';

const menuIsOpen = ref(false);
const route = useRoute();
const userStore = useUserStore();

function openCloseMenu() {
  menuIsOpen.value = !menuIsOpen.value;
}

function isMobile() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches;
}

watch(() => route.fullPath, () => {
  if (isMobile()) menuIsOpen.value = false;
});

// Ensure we have checks in place or fetch if needed
onMounted(() => {
  // Optional: if we wanted to be 100% sure we can fetch user here if missing
  // if (!userStore.id) userStore.hydrate(); 
});
</script>

<template>
  <div class="wrapper">
    <!-- Mandatory Onboarding Modal Overlay -->
    <OnboardingModal v-if="userStore.isAuthenticated && userStore.onboardingCompleted === false" />

    <div class="header">
      <UserHeader @toggle-sidebar="openCloseMenu" />
    </div>
    <button class="floating-menu-btn" type="button" @click="openCloseMenu">
      <i class="fa-solid fa-bars"></i>
    </button>
    <Transition name="overlay-fade">
      <div class="overlay" v-if="menuIsOpen" @click.self="openCloseMenu">
        <Transition name="panel-slide">
          <div class="overlay-panel">
            <div class="overlay-head">
              <img src="../assets/iso-verde.png" alt="logo" class="overlay-logo" />
            </div>
            <UserSidebar :menuIsOpen="false" @navigate="openCloseMenu" />
          </div>
        </Transition>
      </div>
    </Transition>
    <div class="layout">
      <div class="layout-menu-wrapper">
        <UserSidebar :menuIsOpen="menuIsOpen" />
      </div>
      <div class="layout-view-wrapper">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);

  .header {
    width: 100%;
    flex: 0 0 auto;
  }

  .floating-menu-btn {
    display: none;
  }

  .overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: color-mix(in oklab, var(--text), transparent 68%);
    z-index: 1000;
  }

  .overlay-panel {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    max-width: 280px;
    background: var(--bg);
    border-right: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba($FUDMASTER-DARK, 0.2);
    display: flex;
    flex-direction: column;

  }

  .overlay-head {
    padding: 16px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .overlay-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }
}

.layout {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;

  &-menu-wrapper {
    width: 100%;
    max-width: fit-content;
    min-width: 24px;
    overflow: hidden;
    flex: 0 0 auto;
  }

  &-view-wrapper {
    width: 100%;
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 1024px) {
  .wrapper {
    .floating-menu-btn {
      position: fixed;
      bottom: 16px;
      left: 16px;
      z-index: 1100;
      background: var(--accent);
      color: $white;
      border: none;
      border-radius: 999px;
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px color-mix(in oklab, var(--text), transparent 80%);
      cursor: pointer;
    }

    .floating-menu-btn:active {
      filter: brightness(0.95);
    }

    .layout {
      &-menu-wrapper {
        display: none;
      }
    }

    .overlay {
      display: block;
    }
  }
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.25s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(-100%);
}
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  variant: {
    type: String as () => 'default' | 'sidebar',
    default: 'default'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const userStore = useUserStore()

const isFreeUser = computed(() => {
  if (!userStore.id) userStore.hydrate()
  return userStore.accountType === 'free'
})

function goToCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <div 
    v-if="isFreeUser" 
    class="upgrade-banner" 
    :class="[props.variant, { 'compact': compact }]"
    @click="goToCheckout"
  >
    <!-- Compact View -->
    <div v-if="compact" class="compact-content">
      <i class="fa-solid fa-crown icon-crown" />
    </div>

    <!-- Full View -->
    <div v-else class="full-content">
      <div class="upgrade-content">
        <div v-if="variant === 'default'" class="upgrade-icon">
          <i class="fa-solid fa-crown" />
        </div>
        <i v-else class="fa-solid fa-crown icon-crown" />
        
        <div class="upgrade-text">
          <h3 v-if="variant === 'default'">Hazte Founder</h3>
          <p>{{ variant === 'default' ? 'Accede a todos los cursos y contenido exclusivo.' : 'Desbloquea todo el contenido' }}</p>
        </div>
      </div>
      
      <button class="upgrade-btn">
        {{ variant === 'default' ? 'Obtener Acceso' : 'Hazte Founder' }}
        <i v-if="variant === 'default'" class="fa-solid fa-arrow-right" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upgrade-banner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  
  // Default variant styles
  &.default {
    padding: 16px;
    
    .full-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 165, 0, 0.15);
      
      .upgrade-btn {
        transform: scale(1.05);
      }
    }
    
    @media (max-width: 640px) {
      .full-content {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .upgrade-btn {
        width: 100%;
        justify-content: center;
      }
    }

    .upgrade-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .upgrade-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #000;
      flex-shrink: 0;
    }

    .upgrade-text {
      h3 {
        margin: 0;
        font-size: 18px;
        color: var(--text);
      }
      
      p {
        margin: 4px 0 0;
        font-size: 14px;
        color: color-mix(in oklab, var(--text), transparent 30%);
      }
    }

    .upgrade-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #000;
      border: none;
      border-radius: 99px;
      padding: 10px 20px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s;
      white-space: nowrap;
    }
  }

  // Sidebar variant styles
  &.sidebar {
    padding: 12px;
    text-align: center;
    background: transparent;
    border: 1px dashed rgba(255, 165, 0, 0.3);
    
    &:hover {
      border-color: rgba(255, 165, 0, 0.6);
      background: rgba(255, 165, 0, 0.05);
    }
    
    &.compact {
      padding: 8px;
      border: none;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      
      &:hover {
        background: rgba(255, 165, 0, 0.1);
        border-radius: 8px;
      }
      
      .icon-crown {
        font-size: 20px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
      }
    }
    
    .upgrade-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      
      .icon-crown {
        font-size: 20px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        -webkit-background-clip: text;
        background-clip: text;

        -webkit-text-fill-color: transparent;
      }
      
      .upgrade-text {
        p {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.3;
        }
      }
    }
    
    .upgrade-btn {
      width: 100%;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      border: none;
      border-radius: 6px;
      padding: 8px;
      color: #000;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(255, 165, 0, 0.2);
      }
    }
  }
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// Definición estricta de Props
interface Props {
  open: boolean
  title?: string
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '¡Espera! 🛑',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'stay'): void
  (e: 'leave'): void
}>()

// Bloquear el scroll del body cuando el modal está abierto
onMounted(() => {
  if (props.open) document.body.style.overflow = 'hidden'
})
// Restaurar scroll al desmontar (o podrías usar un watcher en 'open')
onUnmounted(() => {
  document.body.style.overflow = ''
})

function handleOverlayClick() {
  // Opcional: Si hacen click fuera, ¿queremos que se cierre? 
  // En estrategias agresivas de retención, a veces es mejor obligar a elegir un botón.
  // Aquí lo dejaremos que cierre (equivale a quedarse).
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-entry">
      <div v-if="props.open" class="modal-backdrop" @click.self="handleOverlayClick">
        
        <div class="modal-container" role="dialog" aria-modal="true" :aria-label="props.title">
          
          <div class="modal-header">
            <div class="icon-wrapper">
              <i class="fa-solid fa-triangle-exclamation" />
            </div>
          </div>

          <div class="modal-content">
            <h3 class="modal-title">{{ props.title }}</h3>
            <p class="modal-message">{{ props.message }}</p>
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              class="btn-primary" 
              @click="emit('stay')"
            >
              Mantener mi descuento y Continuar
            </button>
            
            <button 
              type="button" 
              class="btn-secondary" 
              @click="emit('leave')"
            >
              Entiendo, prefiero arriesgarme a pagar $349 más tarde
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
// Variables locales (Fallback si no tienes las globales definidas en este contexto)
$c-dark: #1a1a1a;
$c-green: #10B981; // Tu verde Fudmaster aproximado
$c-red: #EF4444;
$c-white: #ffffff;
$c-gray-text: #4B5563;
$shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba($c-dark, 0.6);
  backdrop-filter: blur(4px); // Efecto vidrio esmerilado
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  background: $c-white;
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  box-shadow: $shadow-lg;
  padding: 2rem;
  text-align: center;
  position: relative;
  border: 1px solid rgba($c-dark, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background-color: rgba($c-red, 0.1); // Fondo rojo muy suave para alerta
  color: $c-red;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto; // Centrado
  animation: pulse 2s infinite;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: $c-dark;
  margin: 0;
  line-height: 1.2;
}

.modal-message {
  font-size: 1rem;
  color: $c-gray-text;
  line-height: 1.6;
  margin: 0;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-primary {
  background-color: $c-green;
  color: $c-white;
  border: none;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba($c-green, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba($c-green, 0.3);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-secondary {
  background: transparent;
  border: none;
  color: lighten($c-gray-text, 20%);
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;

  &:hover {
    color: $c-red; // Se pone rojo sutilmente al pasar el mouse para indicar peligro
  }
}

// Animaciones Vue Transition
.modal-entry-enter-active,
.modal-entry-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-entry-enter-from,
.modal-entry-leave-to {
  opacity: 0;
}

.modal-entry-enter-from .modal-container,
.modal-entry-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba($c-red, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba($c-red, 0); }
  100% { box-shadow: 0 0 0 0 rgba($c-red, 0); }
}
</style>
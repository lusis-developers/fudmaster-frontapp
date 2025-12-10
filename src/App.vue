<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

type ConfirmPayload = { title?: string; message?: string; confirmText?: string; cancelText?: string; onConfirm?: () => void }

const confirmOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmText = ref('Confirmar')
const cancelText = ref('Cancelar')
let confirmAction: (() => void) | null = null

function openConfirm(payload: ConfirmPayload = {}) {
  confirmTitle.value = payload.title || 'Confirmar'
  confirmMessage.value = payload.message || ''
  confirmText.value = payload.confirmText || 'Confirmar'
  cancelText.value = payload.cancelText || 'Cancelar'
  confirmAction = payload.onConfirm || null
  confirmOpen.value = true
}

function closeConfirm() { confirmOpen.value = false }
function doConfirm() { try { confirmAction?.() } finally { closeConfirm() } }

function onGlobalConfirm(e: Event) {
  const d = (e as CustomEvent).detail as ConfirmPayload
  openConfirm(d || {})
}

onMounted(() => { window.addEventListener('app:confirm', onGlobalConfirm as EventListener) })
onBeforeUnmount(() => { window.removeEventListener('app:confirm', onGlobalConfirm as EventListener) })
</script>

<template>
  <div class="app-container">
    <div class="app-container-view">
      <RouterView />
    </div>
    <Transition name="modal-fade">
      <div v-if="confirmOpen" class="global-modal" @click.self="closeConfirm">
        <div class="global-modal-panel">
          <h3 class="global-modal-title">{{ confirmTitle }}</h3>
          <p v-if="confirmMessage" class="global-modal-message">{{ confirmMessage }}</p>
          <div class="global-modal-actions">
            <button type="button" class="btn cancel" @click="closeConfirm">{{ cancelText }}</button>
            <button type="button" class="btn confirm" @click="doConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
.app-container {
  background-color: $white;
  font-family: $font-principal;
  min-height: 100vh;
  width: 100%;

  &-view {
    width: 100%;
  }
}  .global-modal { position: fixed; inset: 0; background: rgba($FUDMASTER-DARK, 0.4); z-index: 2000; display: grid; place-items: center; padding: 16px; }
  .global-modal-panel { background: $white; border: 1px solid rgba($FUDMASTER-DARK, 0.08); border-radius: 12px; width: 100%; max-width: 440px; padding: 16px; display: grid; gap: 12px; }
  .global-modal-title { margin: 0; color: $FUDMASTER-DARK; font-size: 18px; }
  .global-modal-message { margin: 0; color: rgba($FUDMASTER-DARK, 0.8); font-size: 14px; }
  .global-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .btn { border: none; border-radius: 8px; padding: 8px 12px; font-size: 14px; cursor: pointer; }
  .btn.cancel { background: $FUDMASTER-LIGHT; color: $FUDMASTER-DARK; border: 1px solid rgba($FUDMASTER-DARK, 0.12); }
  .btn.confirm { background: $FUDMASTER-DARK; color: $white; }

  .modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
  .modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

</style>

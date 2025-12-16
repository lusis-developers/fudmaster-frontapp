<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import certificatesService from '@/services/certificates.service'

const route = useRoute()
const router = useRouter()

const certificateId = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<any>(null)

async function verify() {
  if (!certificateId.value.trim()) return
  
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    const { data } = await certificatesService.verify(certificateId.value.trim())
    result.value = data
    // Update URL without reloading if not already there
    if (route.params.id !== certificateId.value) {
      router.replace(`/verify-certificate/${certificateId.value}`)
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Certificado no encontrado o inválido.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  if (route.params.id) {
    certificateId.value = route.params.id as string
    verify()
  }
})
</script>

<template>
  <div class="verify-page">
    <div class="card">
      <div class="header">
        <i class="fa-solid fa-shield-check icon"></i>
        <h1 class="title">Verificación de Certificados</h1>
        <p class="subtitle">Ingresa el ID del certificado para validar su autenticidad.</p>
      </div>

      <form @submit.prevent="verify" class="search-form">
        <div class="input-wrapper">
          <i class="fa-solid fa-barcode input-icon"></i>
          <input 
            v-model="certificateId" 
            type="text" 
            placeholder="Ej: 60d5ecb8b4..." 
            class="input"
            :disabled="loading"
          />
        </div>
        <button type="submit" class="btn primary" :disabled="loading || !certificateId">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          <span v-else>Verificar</span>
        </button>
      </form>

      <div v-if="error" class="alert error">
        <i class="fa-solid fa-circle-xmark"></i>
        <span>{{ error }}</span>
      </div>

      <div v-if="result" class="result-card">
        <div class="status-badge valid">
          <i class="fa-solid fa-check-circle"></i> Certificado Válido
        </div>

        <div class="cert-details">
          <div class="detail-row">
            <span class="label">Estudiante:</span>
            <span class="value">{{ result.user?.name || result.user?.email || 'Estudiante' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Curso:</span>
            <span class="value">{{ result.course?.title || result.certificate?.quizRef?.title || 'Curso Completado' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha de emisión:</span>
            <span class="value">{{ formatDate(result.certificate?.createdAt) }}</span>
          </div>
          <div class="detail-row id-row">
            <span class="label">ID de Certificado:</span>
            <span class="value code">{{ result.certificate?._id }}</span>
          </div>
        </div>

        <div v-if="result.certificate?.pdfUrl" class="preview-actions">
          <a :href="result.certificate.pdfUrl" target="_blank" class="btn outline">
            <i class="fa-solid fa-file-pdf"></i> Ver Certificado Original
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.verify-page {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.card {
  background: var(--bg, #fff);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
  border: 1px solid var(--border, #eee);
  animation: slideUp 0.4s ease-out;
}

.header {
  text-align: center;
  margin-bottom: 32px;

  .icon {
    font-size: 48px;
    color: var(--accent, #2BBB92);
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
    font-weight: 800;
    color: var(--text, #333);
    margin: 0 0 8px 0;
  }

  .subtitle {
    font-size: 14px;
    color: color-mix(in oklab, var(--text, #333), transparent 40%);
    margin: 0;
  }
}

.search-form {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
  
  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: color-mix(in oklab, var(--text, #333), transparent 60%);
  }

  .input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    border: 1px solid var(--border, #ddd);
    border-radius: 12px;
    font-size: 16px;
    background: var(--bg-input, #f9f9f9);
    color: var(--text, #333);
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: var(--accent, #2BBB92);
      background: var(--bg, #fff);
      box-shadow: 0 0 0 4px rgba(43, 187, 146, 0.1);
    }
  }
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &.primary {
    background: var(--accent, #2BBB92);
    color: white;

    &:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &.outline {
    background: transparent;
    border: 2px solid var(--accent, #2BBB92);
    color: var(--accent, #2BBB92);
    text-decoration: none;

    &:hover {
      background: var(--accent, #2BBB92);
      color: white;
    }
  }
}

.alert {
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  margin-bottom: 24px;

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
}

.result-card {
  background: color-mix(in oklab, var(--accent, #2BBB92), transparent 95%);
  border: 1px solid color-mix(in oklab, var(--accent, #2BBB92), transparent 80%);
  border-radius: 16px;
  padding: 24px;
  animation: fadeIn 0.3s ease;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent, #2BBB92);
  color: white;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cert-details {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(0,0,0,0.05);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .label {
    color: color-mix(in oklab, var(--text, #333), transparent 40%);
  }

  .value {
    font-weight: 600;
    color: var(--text, #333);
    text-align: right;
  }

  .code {
    font-family: monospace;
    letter-spacing: 1px;
    background: rgba(0,0,0,0.05);
    padding: 2px 6px;
    border-radius: 4px;
    word-break: break-all;
  }
}

@media (max-width: 480px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .value {
      text-align: left;
    }
  }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

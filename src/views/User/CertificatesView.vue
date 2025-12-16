<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCertificatesStore } from '@/stores/certificates'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useCertificatesStore()
const userStore = useUserStore()

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  return (userStore.id as any) || ''
})

const certificates = computed(() => store.items)

onMounted(() => {
  if (userId.value) {
    store.fetchAll(userId.value)
  }
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function openCertificate(url: string) {
  if (url) window.open(url, '_blank')
}

function goToCourses() {
  router.push('/courses')
}
</script>

<template>
  <div class="certificates-view">
    <div class="container">
      <div class="header">
        <h2 class="title"><i class="fa-solid fa-certificate" /> Mis Certificados</h2>
      </div>
      <p class="subtitle">Aquí encontrarás todos los certificados obtenidos al completar tus cursos.</p>

      <div v-if="store.loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin" /> Cargando certificados...
      </div>

      <div v-else-if="store.error" class="error">
        <i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}
      </div>

      <div v-else>
        <div v-if="certificates.length === 0" class="empty">
          <div class="empty-icon">
            <i class="fa-solid fa-award" />
          </div>
          <p class="empty-text">Aún no tienes certificados.</p>
          <p class="empty-subtext">¡Completa tus cursos y aprueba los quices para obtenerlos!</p>
          <button class="btn primary" @click="goToCourses">Ir a mis cursos</button>
        </div>
        
        <div v-else class="grid">
          <div v-for="cert in certificates" :key="cert._id" class="card">
            <div class="preview" @click="openCertificate(cert.pdfUrl)">
              <img 
                v-if="cert.pdfUrl" 
                :src="cert.pdfUrl" 
                :alt="(cert.quizRef && cert.quizRef.title) || 'Certificado'" 
                loading="lazy" 
              />
              <div v-else class="preview-placeholder">
                <i class="fa-solid fa-award" />
              </div>
              <div class="overlay">
                <i class="fa-solid fa-expand" />
              </div>
            </div>
            
            <div class="card-content">
              <div class="info">
                <h3 class="course-name" :title="(cert.quizRef && cert.quizRef.title)">
                  {{ (cert.quizRef && cert.quizRef.title) || 'Certificado de Curso' }}
                </h3>
                <p class="date">
                  <i class="fa-solid fa-calendar-days" />
                  {{ formatDate(cert.createdAt) }}
                </p>
              </div>
              
              <button class="btn download" @click="openCertificate(cert.pdfUrl)">
                <i class="fa-solid fa-download" /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.certificates-view {
  width: 100%;
  padding: 32px 16px;
  background: var(--bg);
  color: var(--text);
  min-height: 80vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 32px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title {
  color: var(--text);
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  
  i {
    color: var(--accent);
  }
}

.subtitle {
  color: color-mix(in oklab, var(--text), transparent 30%);
  margin: 0;
  font-size: 16px;
  max-width: 600px;
  line-height: 1.5;
}

.loading, .error {
  padding: 60px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: 16px;
  color: color-mix(in oklab, var(--text), transparent 40%);
  display: grid;
  gap: 16px;
  justify-items: center;
  font-size: 16px;

  i {
    font-size: 32px;
  }
}

.error {
  color: var(--alert-error, #ef4444);
  background: rgba(239, 68, 68, 0.05);
  border-style: solid;
}

.empty {
  display: grid;
  gap: 24px;
  justify-items: center;
  text-align: center;
  padding: 80px 20px;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 24px;
}

.empty-icon {
  font-size: 64px;
  color: color-mix(in oklab, var(--text), transparent 80%);
  margin-bottom: 8px;
}

.empty-text {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.empty-subtext {
  margin: 0;
  color: color-mix(in oklab, var(--text), transparent 40%);
  max-width: 400px;
  line-height: 1.6;
}

.grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
    border-color: color-mix(in oklab, var(--accent), transparent 70%);

    .overlay {
      opacity: 1;
    }
    
    .preview img {
      transform: scale(1.05);
    }
  }
}

.preview {
  width: 100%;
  aspect-ratio: 16/11; /* Similar to certificate proportions */
  background: color-mix(in oklab, var(--text), transparent 95%);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: color-mix(in oklab, var(--text), transparent 85%);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  font-size: 32px;
  backdrop-filter: blur(2px);
}

.card-content {
  padding: 20px;
  display: grid;
  gap: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info {
  display: grid;
  gap: 8px;
  flex: 1;
}

.course-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text);
  
  /* Limit to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  margin: 0;
  font-size: 13px;
  color: color-mix(in oklab, var(--text), transparent 40%);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 600;
}

.btn.primary {
  background: var(--accent);
  color: white;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
}

.btn.download {
  width: 100%;
  background: color-mix(in oklab, var(--text), transparent 96%);
  color: var(--text);
  
  &:hover {
    background: var(--accent);
    color: white;
  }
}

@media (min-width: 960px) {
  .certificates-view {
    padding: 40px;
  }
}
</style>

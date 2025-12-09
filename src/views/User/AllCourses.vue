<script setup lang="ts">
import { onMounted } from 'vue'
import { useCoursesStore } from '@/stores/courses'

const store = useCoursesStore()

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(course: any) {
  return sanitizeUrl(course.image_url) || sanitizeUrl(course.coverUrl) || '/src/assets/fudmaster-color.png'
}

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <div class="all-courses">
    <div class="container">
      <h2 class="title"><i class="fa-solid fa-list" /> Todos los cursos</h2>
      <p class="subtitle">Explora todo nuestro catálogo disponible.</p>

      <div v-if="store.loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin" /> Cargando cursos...
      </div>

      <div v-else-if="store.error" class="error">
        <i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}
      </div>

      <div v-else class="grid">
        <div v-if="store.courses.length === 0" class="empty">
          <i class="fa-regular fa-face-smile" />
          <span>No hay cursos disponibles por ahora.</span>
        </div>
        <div v-else class="cards">
          <RouterLink v-for="c in store.courses" :key="c._id || c.id" class="card" :to="`/courses/${c.id}`">
            <div class="cover">
              <img :src="coverOf(c)" alt="cover" />
            </div>
            <div class="info">
              <h3 class="name">{{ c.name || c.title || 'Curso sin título' }}</h3>
              <p class="desc">{{ c.heading || c.description || c.shortDescription || 'Detalles próximamente.' }}</p>
            </div>
            <div class="meta">
              <span><i class="fa-solid fa-clapperboard" /> {{ c.lecturesCount ?? c.lectures?.length ?? 0 }} lecciones</span>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.all-courses {
  width: 100%;
  padding: 24px 16px;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

.title {
  color: $FUDMASTER-DARK;
  font-size: 24px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  color: #777;
  margin: 0;
}

.loading,
.error,
.empty {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #555;
  background: $FUDMASTER-LIGHT;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 12px 14px;
}

.error {
  color: $alert-error;
  background: $alert-error-bg;
  border-color: rgba($alert-error, 0.3);
}

.grid {
  width: 100%;
}

.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1080px) {
  .cards {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.card { background: $white; border: 1px solid #e6e6e6; border-radius: 16px; overflow: hidden; display: grid; text-decoration: none; }

.cover img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.info {
  display: grid;
  gap: 6px;
  padding: 12px;
}

.name {
  color: $FUDMASTER-DARK;
  margin: 0;
  font-size: 18px;
}

.desc {
  color: #777;
  margin: 0;
  font-size: 14px;
}

.meta {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const store = useCoursesStore()

const id = computed(() => route.params.id as string)

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(course: any) {
  return sanitizeUrl(course?.image_url) || sanitizeUrl(course?.coverUrl) || '/src/assets/fudmaster-color.png'
}

onMounted(() => {
  if (id.value) store.fetchById(id.value)
})

function openLecture(lectureId: number | string) {
  if (!id.value) return
  store.fetchLecture(id.value, lectureId)
}
</script>

<template>
  <div class="course-detail">
    <div class="container">
      <div v-if="store.loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin" /> Cargando curso...
      </div>

      <div v-else-if="store.error" class="error">
        <i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}
      </div>

      <div v-else-if="!store.currentCourse" class="empty">
        <i class="fa-regular fa-face-meh" /> No se encontró el curso.
      </div>

      <div v-else class="content">
        <div class="cover">
          <img :src="coverOf(store.currentCourse)" alt="course cover" />
        </div>
        <div class="info">
          <h2 class="title">{{ store.currentCourse.name || store.currentCourse.title }}</h2>
          <p class="subtitle">{{ store.currentCourse.heading || store.currentCourse.shortDescription || store.currentCourse.description }}</p>
          <div class="author" v-if="store.currentCourse.author_bio">
            <span class="author-name"><i class="fa-solid fa-user" /> {{ store.currentCourse.author_bio.name }}</span>
          </div>
          <div v-if="store.currentLecture" class="lecture-detail">
            <h3 class="lecture-title"><i class="fa-solid fa-chalkboard" /> Detalle de la lección</h3>
            <div class="lecture-card">
              <div class="row"><span class="label">ID:</span><span>{{ store.currentLecture.id || '-' }}</span></div>
              <div class="row"><span class="label">Posición:</span><span>{{ store.currentLecture.position ?? '-' }}</span></div>
              <div class="row"><span class="label">Estado:</span><span>{{ store.currentLecture.is_published ? 'Publicada' : 'Borrador' }}</span></div>
            </div>
          </div>
        </div>
        <div class="sections" v-if="Array.isArray(store.currentCourse.lecture_sections) && store.currentCourse.lecture_sections.length">
          <h3 class="sections-title"><i class="fa-solid fa-list-check" /> Contenido del curso</h3>
          <div class="sections-list">
            <div class="section" v-for="s in store.currentCourse.lecture_sections" :key="s.id">
              <div class="section-header">
                <span class="section-name">{{ s.name }}</span>
                <span class="badge">{{ s.lectures?.length || 0 }} lecciones</span>
              </div>
              <ul class="lectures">
                <li v-for="l in s.lectures" :key="l.id" @click="openLecture(l.id)" class="lecture-item">
                  <span>Lección {{ l.position }}</span>
                  <i class="fa-solid fa-arrow-right" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.course-detail {
  width: 100%;
  padding: 24px 16px;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
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

.content {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 960px) {
  .content {
    grid-template-columns: 1.4fr 1fr;
  }
}

.cover img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.info {
  display: grid;
  gap: 8px;
}

.title {
  color: $FUDMASTER-DARK;
  margin: 0;
  font-size: 26px;
}

.subtitle { color: #777; margin: 0; font-size: 15px; }
.author { display: inline-flex; align-items: center; gap: 8px; color: #555; font-size: 14px; }
.lecture-detail { display: grid; gap: 8px; margin-top: 10px; }
.lecture-title { color: $FUDMASTER-DARK; font-size: 18px; margin: 0; display: inline-flex; align-items: center; gap: 8px; }
.lecture-card { background: $white; border: 1px solid #e6e6e6; border-radius: 12px; padding: 12px; display: grid; gap: 6px; }
.row { display: flex; gap: 8px; color: #555; font-size: 14px; }
.label { color: $FUDMASTER-DARK; font-weight: 600; }

.sections {
  grid-column: 1 / -1;
  display: grid;
  gap: 12px;
}

.sections-title {
  color: $FUDMASTER-DARK;
  margin: 12px 0 0;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sections-list {
  display: grid;
  gap: 12px;
}

.section {
  background: $white;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.section-name {
  color: $FUDMASTER-DARK;
  font-weight: 600;
}

.badge {
  background: $FUDMASTER-LIGHT;
  border: 1px solid #e6e6e6;
  color: #555;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
}

.lectures { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.lectures li { color: #555; font-size: 14px; }
.lecture-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: $FUDMASTER-LIGHT; border: 1px solid #e6e6e6; border-radius: 8px; padding: 8px 10px; cursor: pointer; }
.lecture-item:hover { border-color: $FUDMASTER-GREEN; color: $FUDMASTER-DARK; }
</style>

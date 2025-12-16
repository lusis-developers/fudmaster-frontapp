<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'
import PlaylistSidebar from '@/components/lecture/PlaylistSidebar.vue'

const route = useRoute()
const router = useRouter()
const store = useCoursesStore()
const userStore = useUserStore()

const id = computed(() => route.params.id as string)

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  const uid = userStore.id
  return typeof uid === 'number' ? String(uid) : (uid || '')
})

const progressPercent = computed(() => Number(store.progress?.percent || 0))
const progressText = computed(() => {
  const c = Number(store.progress?.completed || 0)
  const t = Number(store.progress?.total || 0)
  return `${c}/${t}`
})

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(course: any) {
  return sanitizeUrl(course?.image_url) || sanitizeUrl(course?.coverUrl) || '/src/assets/fudmaster-color.png'
}

function flattenLectures(course: any): any[] {
  const sections = Array.isArray(course?.lecture_sections) ? course.lecture_sections : []
  const list: any[] = []
  for (const s of sections) {
    const lectures = Array.isArray(s?.lectures) ? s.lectures : []
    for (const l of lectures) list.push(l)
  }
  return list.sort((a, b) => Number(a?.position || 0) - Number(b?.position || 0))
}

const firstLectureId = computed(() => {
  const course = store.currentCourse
  if (!course) return null as any
  const all = flattenLectures(course)
  return all[0]?.id || null
})

onMounted(async () => {
  if (id.value) {
    await store.fetchById(id.value)
    if (userId.value) {
      await store.fetchProgress(id.value, userId.value)
    }
  }
})

const finishedCourse = computed(() => {
  const c = Number(store.progress?.completed || 0)
  const t = Number(store.progress?.total || 0)
  return t > 0 && c >= t
})


function openLecture(lectureId: number | string) {
  if (!id.value) return
  router.push(`/courses/${id.value}/lectures/${lectureId}`)
}

function goBack() { router.back() }

async function startQuiz() {
  if (!id.value) return
  router.push(`/courses/${id.value}/quiz`)
}
</script>

<template>
  <div class="course-detail">
    <div class="container">
      <div class="progress">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-meta">Progreso: {{ progressPercent }}% · {{ progressText }}</div>
      </div>
      <div v-if="store.loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin" /> Cargando curso...
      </div>

      <div v-else-if="store.error" class="error">
        <i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}
      </div>

      <div v-else-if="!store.currentCourse" class="empty">
        <i class="fa-regular fa-face-meh" /> No se encontró el curso.
      </div>

      <div v-else>
        <div class="header">
          <button class="back" type="button" @click="goBack"><i class="fa-solid fa-arrow-left" /> Volver</button>
          <h2 class="title"><i class="fa-solid fa-graduation-cap" /> {{ store.currentCourse.name || store.currentCourse.title }}</h2>
        </div>
        <div class="content">
          <div class="left">
            <div class="cover">
              <img :src="coverOf(store.currentCourse)" alt="course cover" />
            </div>
            <div class="info">
              <p class="subtitle">{{ store.currentCourse.heading || store.currentCourse.shortDescription || store.currentCourse.description }}</p>
              <div class="author" v-if="store.currentCourse.author_bio">
                <span class="author-name"><i class="fa-solid fa-user" /> {{ store.currentCourse.author_bio.name }}</span>
              </div>
              <div class="actions">
                <button class="cta-start" type="button" :disabled="!firstLectureId" @click="firstLectureId && openLecture(firstLectureId)"><i class="fa-solid fa-play" /> Iniciar clase</button>
                <button v-if="finishedCourse" class="cta-start" type="button" @click="startQuiz"><i class="fa-solid fa-list-check" /> Iniciar quiz</button>
              </div>
            </div>
          </div>
          <div class="right" v-if="Array.isArray(store.currentCourse.lecture_sections) && store.currentCourse.lecture_sections.length">
            <PlaylistSidebar :sections="store.currentCourse.lecture_sections" :course-id="String(id)" :completed-lecture-ids="store.progress.completedLectureIds" />
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.course-detail { width: 100%; padding: 24px 16px; background: var(--bg); color: var(--text); }
.container { max-width: 100%; margin: 0 auto; display: grid; gap: 16px; }
.progress { display: grid; gap: 6px; }
.progress-bar { height: 8px; background: var(--accent); width: 0%; transition: width 0.3s ease; border-radius: 999px; }
.progress-meta { color: color-mix(in oklab, var(--text), transparent 40%); font-size: 12px; }

.header { display: grid; gap: 8px; }
.back { background: none; border: none; color: var(--accent); display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }

.loading,
.error,
.empty {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: color-mix(in oklab, var(--text), transparent 40%);
  background: color-mix(in oklab, var(--bg), var(--text) 6%);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
}

.error {
  color: $alert-error;
  background: $alert-error-bg;
  border-color: rgba($alert-error, 0.3);
}

.content { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 960px) { .content { grid-template-columns: 1.4fr 1fr; } }
@media (min-width: 1280px) { .content { grid-template-columns: 1.8fr 1fr; } }
.left { display: grid; gap: 12px; }
.right { display: grid; gap: 12px; }

.cover img {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
  display: block;
  box-shadow: 0 20px 40px -10px rgba($FUDMASTER-DARK, 0.06);
}

.info {
  display: grid;
  gap: 8px;
}

.title {
  color: var(--text);
  margin: 0;
  font-size: 26px;
  padding: 24px 0;
}

.subtitle { color: color-mix(in oklab, var(--text), transparent 40%); margin: 0; font-size: 15px; line-height: 1.6; }
.author { display: inline-flex; align-items: center; gap: 8px; color: color-mix(in oklab, var(--text), transparent 60%); font-size: 14px; }
.author-name { color: var(--accent); }
.actions { margin-top: 8px; }
.cta-start { background: $FUDMASTER-PINK; color: $white; border: none; border-radius: 999px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
.cta-start:disabled { background: color-mix(in oklab, var(--bg), var(--text) 6%); color: color-mix(in oklab, var(--text), transparent 50%); border: 1px solid var(--border); cursor: not-allowed; }
.cta-start:hover { filter: brightness(0.95); }

.quiz-section { margin-top: 16px; }


</style>

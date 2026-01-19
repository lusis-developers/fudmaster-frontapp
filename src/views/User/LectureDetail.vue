<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'
import { useQuizzesStore } from '@/stores/quizzes'
import { useGamificationStore } from '@/stores/gamification.store'
import ExitIntentModal from '@/components/ExitIntentModal.vue'
import CommentsThread from '@/components/CommentsThread.vue'
import LectureVideoPlayer from '@/components/lecture/LectureVideoPlayer.vue'
import LectureAttachments from '@/components/lecture/LectureAttachments.vue'
import LectureTabs from '@/components/lecture/LectureTabs.vue'
import PlaylistSidebar from '@/components/lecture/PlaylistSidebar.vue'

const route = useRoute()
const router = useRouter()
const store = useCoursesStore()
const userStore = useUserStore()
const quizzesStore = useQuizzesStore()
const gamificationStore = useGamificationStore()

const courseId = computed(() => route.params.id as string)
const lectureId = computed(() => route.params.lectureId as string)

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  const uid = userStore.id
  return typeof uid === 'number' ? String(uid) : (uid || '')
})

const teachableUserId = computed(() => {
  if (!userStore.teachableUserId) userStore.hydrate()
  const t = userStore.teachableUserId as any
  return typeof t === 'number' ? String(t) : (t || '')
})

const progressPercent = computed(() => Number(store.progress?.percent || 0))
const progressText = computed(() => {
  const c = Number(store.progress?.completed || 0)
  const t = Number(store.progress?.total || 0)
  return `${c}/${t}`
})

const completing = ref(false)
const completeError = ref('')
const completeSuccess = ref('')

const currentUrl = computed(() => {
  const att = (store.currentLecture?.attachments || []).find((a: any) => a?.kind === 'video' && a?.url)
  const u = (att?.url || '').toString().replace(/`/g, '').trim()
  return u
})

function flattenLectures(course: any): any[] {
  const sections = Array.isArray(course?.lecture_sections) ? course.lecture_sections : []
  const list: any[] = []
  for (const s of sections) {
    const lectures = Array.isArray(s?.lectures) ? s.lectures : []
    for (const l of lectures) list.push(l)
  }
  return list.sort((a, b) => Number(a?.position || 0) - Number(b?.position || 0))
}

const nextLecture = computed(() => {
  const course = store.currentCourse
  const current = store.currentLecture
  if (!course || !current) return null as any
  const all = flattenLectures(course)
  const idx = all.findIndex((l: any) => String(l?.id) === String(current?.id))
  if (idx < 0) return null as any
  return all[idx + 1] || null
})

function goToNext(scope: 'global' | 'section' = 'global') {
  if (!courseId.value) return
  console.log('[LectureDetail] Continuar click', { scope, courseId: courseId.value, lectureId: lectureId.value })
    ; (async () => {
      completing.value = true
      completeError.value = ''
      completeSuccess.value = ''
      try {
        if (courseId.value && lectureId.value) {
          console.log('[LectureDetail] completeLecture start')
          const res = await store.completeLecture(courseId.value, lectureId.value, { userId: userId.value, teachableUserId: teachableUserId.value })
          console.log('[LectureDetail] completeLecture done')
          if (res === null) {
            const msg = store.error || 'No se pudo marcar la clase como completada.'
            completeError.value = msg
            console.log('[LectureDetail] completeLecture failed', msg)
          } else {
            completeSuccess.value = 'Clase marcada como completada.'
          }
          if (courseId.value && userId.value) {
            console.log('[LectureDetail] fetchProgress start')
            await store.fetchProgress(courseId.value, userId.value)
            console.log('[LectureDetail] fetchProgress done', { progress: store.progress })
            console.log('[LectureDetail] fetchPoints start')
            await gamificationStore.fetchPoints(userId.value)
            console.log('[LectureDetail] fetchPoints done', { points: gamificationStore.points })
          }
        }
      } catch (e) {
        console.log('[LectureDetail] error in completion/progress', e)
        completeError.value = (e as any)?.message || 'Error al completar la clase.'
      }
      if (!completeError.value) {
        store.goToNextLecture(courseId.value, router, scope, lectureId.value)
      }
      completing.value = false
    })()
}

function goBack() { router.back() }


const checkingQuiz = ref(false)
const quizModalOpen = ref(false)
function formatCountdown(ms: number): string {
  const total = Math.max(ms, 0)
  const s = Math.floor(total / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}
function remainingBlockMs(): number {
  const ra = quizzesStore.retryAfterMs
  const rv = quizzesStore.retryAvailableAt
  if (rv) {
    const t = new Date(rv).getTime()
    if (!Number.isNaN(t)) return Math.max(t - Date.now(), 0)
  }
  const add = typeof ra === 'number' ? ra : 0
  return Math.max(add, 0)
}
const quizModalTitle = computed(() => 'No puedes iniciar el quiz aún')
const quizModalMessage = computed(() => `Podrás iniciar en ${formatCountdown(remainingBlockMs())}`)
function closeQuizModal() { quizModalOpen.value = false }
function onQuizModalStay() { quizModalOpen.value = false }
function onQuizModalLeave() { if (courseId.value) router.push(`/courses/${courseId.value}`) }
async function startQuiz() {
  if (!courseId.value) return
  checkingQuiz.value = true
  try {
    if (!quizzesStore.quizzes.length) await quizzesStore.loadByCourse(courseId.value)
    const first = quizzesStore.quizzes[0]
    if (first?._id) {
      await quizzesStore.loadById(courseId.value, first._id, { userId: userId.value })
    }

    if (quizzesStore.approvedAlready) {
      if (first?._id) router.push(`/courses/${courseId.value}/quizzes/${first._id}/result`)
      else router.push(`/courses/${courseId.value}/quiz/result`)
      return
    }

    const blocked = !!(quizzesStore.retryAfterMs || quizzesStore.retryAvailableAt)
    if (blocked) {
      quizModalOpen.value = true
      return
    }
    router.push(`/courses/${courseId.value}/quiz`)
  } finally {
    checkingQuiz.value = false
  }
}

onMounted(async () => {
  if (courseId.value) await store.fetchById(courseId.value)
  if (courseId.value && lectureId.value) await store.fetchLecture(courseId.value, lectureId.value)
  if (courseId.value && userId.value) await store.fetchProgress(courseId.value, userId.value)
})

watch(lectureId, async (lid) => {
  if (!lid) return
  completing.value = false
  completeError.value = ''
  completeSuccess.value = ''
  store.setCurrentLectureFromCourse(lid)
  if (courseId.value) await store.fetchLecture(courseId.value, lid)
})
watch(progressPercent, (p) => { try { console.log('[LectureDetail] progressPercent', p) } catch { } })
</script>

<template>
  <div class="lecture-detail-view">
    <div class="container">
      <div class="progress">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-meta">Progreso: {{ progressPercent }}% · {{ progressText }}</div>
      </div>
      <div class="header">
        <button class="back" type="button" @click="goBack"><i class="fa-solid fa-arrow-left" /> Volver</button>
        <h2 class="title"><i class="fa-solid fa-chalkboard" /> {{ store.currentLecture?.name || 'Clase' }}</h2>
        <p class="meta">Posición {{ store.currentLecture?.position ?? '-' }} · {{ store.currentLecture?.is_published ? 'Publicada' : 'Borrador' }}</p>
      </div>

      <div v-if="store.loading" class="loading"><i class="fa-solid fa-spinner fa-spin" /> Cargando clase...</div>
      <div v-else-if="store.error" class="error"><i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}</div>
      <div v-else-if="!store.currentLecture" class="empty"><i class="fa-regular fa-face-meh" /> No se encontró la clase.</div>

      <div v-else class="lesson-layout">
        <!-- Main Content (Video, Tabs, Comments) -->
        <div class="main-content">
          <div class="player-wrap">
            <LectureVideoPlayer :key="currentUrl" :video-url="currentUrl" />
          </div>
          
          <div class="next-panel-wrapper">
             <div v-if="nextLecture" class="next-panel">
                <div class="next-head">
                  <h3 class="next-title"><i class="fa-solid fa-forward" /> Siguiente clase</h3>
                  <p class="next-meta">{{ nextLecture.name || `Lección ${nextLecture.position}` }}</p>
                </div>
                <div class="next-actions">
                  <button class="next-cta" type="button" :disabled="completing" @click="goToNext('global')">
                    <i :class="completing ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-check'" />
                    {{ completing ? 'Procesando...' : 'Completar y Continuar' }}
                  </button>
                </div>
                <div v-if="completeError" class="next-error"><i class="fa-solid fa-triangle-exclamation" /> {{ completeError }}</div>
                <div v-else-if="completeSuccess" class="next-success"><i class="fa-solid fa-check" /> {{ completeSuccess }}</div>
            </div>
             <div v-else class="next-panel">
                <div class="next-head">
                  <h3 class="next-title"><i class="fa-solid fa-clipboard-check" /> Quiz final</h3>
                  <p class="next-meta">Has llegado al final del curso.</p>
                </div>
                <div class="next-actions">
                  <button class="next-cta" type="button" :disabled="quizzesStore.loading || checkingQuiz" @click="startQuiz">
                    <i :class="(quizzesStore.loading || checkingQuiz) ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-list-check'" />
                    {{ (quizzesStore.loading || checkingQuiz) ? 'Cargando...' : 'Iniciar quiz' }}
                  </button>
                </div>
              </div>
          </div>

          <LectureTabs :description="store.currentLecture?.description || store.currentLecture?.heading" :has-resources="Array.isArray(store.currentLecture?.attachments) && store.currentLecture.attachments.length > 0">
            <template #resources>
              <LectureAttachments v-if="Array.isArray(store.currentLecture?.attachments) && store.currentLecture.attachments.length" :attachments="store.currentLecture.attachments" />
            </template>
          </LectureTabs>

          <div class="comments-section">
            <CommentsThread :course-id="Number(courseId)" :lecture-id="Number(lectureId)" :show-title="true" />
          </div>
        </div>

        <!-- Sidebar Content (Playlist) -->
        <div class="sidebar-content">
           <PlaylistSidebar 
              class="sticky-playlist"
              :sections="store.currentCourse?.lecture_sections || []" 
              :course-id="Number(courseId)" 
              :current-lecture-id="Number(lectureId)"
              :completed-lecture-ids="store.progress.completedLectureIds" 
            />
        </div>
      </div>
    </div>
  </div>
  <ExitIntentModal
    :open="quizModalOpen"
    :title="quizModalTitle"
    :message="quizModalMessage"
    primary-label="Entendido"
    secondary-label="Volver al curso"
    @close="closeQuizModal"
    @stay="onQuizModalStay"
    @leave="onQuizModalLeave"
  />
</template>

<style lang="scss" scoped>
.lecture-detail-view {
  width: 100%;
  padding: 24px 16px;
  background: var(--bg);
  color: var(--text);
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.progress {
  display: grid;
  gap: 6px;
}

.progress-bar {
  height: 8px;
  background: var(--accent);
  width: 0%;
  transition: width 0.3s ease;
  border-radius: 999px;
}

.progress-meta {
  color: color-mix(in oklab, var(--text), transparent 40%);
  font-size: 12px;
}

.header {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.back {
  background: none;
  border: none;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.title {
  color: var(--text);
  margin: 0;
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.meta {
  color: color-mix(in oklab, var(--text), transparent 60%);
  margin: 0;
  font-size: 14px;
}

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

/* Layout System */
.lesson-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .lesson-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    /* Video takes remaining space, Playlist fixed width */
    align-items: start;
  }
}

@media (min-width: 1440px) {
  .lesson-layout {
    grid-template-columns: 1fr 380px;
  }
}

/* Main Content Area */
.main-content {
  display: grid;
  gap: 24px;
  min-width: 0;
  /* Prevent overflow */
}

.player-wrap {
  background: #000;
  border-radius: 12px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  aspect-ratio: 16/9;
}

/* Next Panel */
.next-panel {
  background: color-mix(in oklab, var(--bg), var(--text) 2%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.next-head {
  display: grid;
  gap: 4px;
}

.next-title {
  color: var(--text);
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.next-meta {
  color: color-mix(in oklab, var(--text), transparent 40%);
  margin: 0;
  font-size: 14px;
}

.next-actions {
  margin-left: auto;
}

.next-cta {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

.next-error {
  color: $alert-error;
  font-size: 13px;
  margin-top: 8px;
}

.next-success {
  color: #10b981;
  font-size: 13px;
  margin-top: 8px;
}

/* Comments Section Wrapper */
.comments-section {
  margin-top: 24px;
  border-top: 1px solid var(--border);
  padding-top: 24px;
}

/* Sidebar */
.sidebar-content {
  display: grid;
  gap: 16px;
}

.sticky-playlist {
  position: sticky;
  top: 24px;
}

@media (max-width: 1023px) {
  .sticky-playlist {
    position: static;
  }

  .next-panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .next-actions {
    margin-left: 0;
    width: 100%;
  }

  .next-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>

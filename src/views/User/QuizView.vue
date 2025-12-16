<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzes'
import { useUserStore } from '@/stores/user'
import QuizRunner from '@/components/quiz/QuizRunner.vue'
import ExitIntentModal from '@/components/ExitIntentModal.vue'

const route = useRoute()
const router = useRouter()
const quizzesStore = useQuizzesStore()
const userStore = useUserStore()

const courseId = computed(() => route.params.id as string)
const quizId = computed(() => route.params.quizId as (string | undefined))

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  const uid = userStore.id
  return typeof uid === 'number' ? String(uid) : (uid || '')
})

onMounted(async () => {
  if (!courseId.value) return
  quizzesStore.clear()
  console.log('[QuizView] init', { courseId: courseId.value, quizId: quizId.value })
  if (quizId.value) {
    await quizzesStore.loadById(courseId.value, quizId.value, { userId: userId.value })
    console.log('[QuizView] loadById done', { hasQuiz: !!quizzesStore.currentQuiz, error: quizzesStore.error })
  } else {
    await quizzesStore.loadByCourse(courseId.value)
    const first = quizzesStore.quizzes[0]
    if (first?._id) {
      await quizzesStore.loadById(courseId.value, first._id, { userId: userId.value })
      console.log('[QuizView] load first quiz done', { quizId: first?._id, hasQuiz: !!quizzesStore.currentQuiz, error: quizzesStore.error })
    }
  }
  window.addEventListener('auth:token-expired', () => console.warn('[QuizView] token expired'))
})

const nowMs = ref(Date.now())
let timer: number | null = null
onMounted(() => { timer = window.setInterval(() => { nowMs.value = Date.now() }, 1000) })
onUnmounted(() => { if (timer) { clearInterval(timer); timer = null } })

const targetMs = computed(() => {
  const at = quizzesStore.retryAvailableAt
  if (at) {
    const d = new Date(at)
    const t = d.getTime()
    if (!Number.isNaN(t)) return t
  }
  const base = Date.now()
  const add = quizzesStore.retryAfterMs || 0
  return base + add
})
const remainingMs = computed(() => Math.max(targetMs.value - nowMs.value, 0))
const blocked = computed(() => remainingMs.value > 0)
const errorText = computed(() => {
  const msg = String(quizzesStore.error || '').trim()
  if (msg === 'Retry not allowed yet.') return 'No puedes reintentar aún'
  return msg
})

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

function goBack() { router.back() }
function goToCourse() { if (courseId.value) router.push(`/courses/${courseId.value}`) }

function onSubmitted() {
  const qid = quizId.value || (quizzesStore.currentQuiz?._id || '')
  if (!courseId.value || !qid) return
  console.log('[QuizView] onSubmitted → navigate', { courseId: courseId.value, quizId: qid })
  router.push(`/courses/${courseId.value}/quizzes/${qid}/result`)
}

const exitOpen = ref(false)
const modalTitle = computed(() => 'No puedes reintentar aún')
const modalMessage = computed(() => `Podrás reintentar en ${formatCountdown(remainingMs.value)}`)
function closeModal() { exitOpen.value = false }
function onModalStay() { exitOpen.value = false }
function onModalLeave() { if (courseId.value) router.push(`/courses/${courseId.value}`) }
watch(() => quizzesStore.approvedAlready, (approved) => {
  if (approved && courseId.value) {
    const qid = quizId.value || quizzesStore.currentQuiz?._id
    if (qid) router.replace(`/courses/${courseId.value}/quizzes/${qid}/result`)
    else router.replace(`/courses/${courseId.value}/quiz/result`)
  }
}, { immediate: true })
watch(blocked, (b) => { exitOpen.value = b })
</script>

<template>
  <div class="quiz-view">
    <div class="container">
      <div class="head">
        <button class="back" type="button" @click="goBack"><i class="fa-solid fa-arrow-left" /> Volver</button>
        <h2 class="title"><i class="fa-solid fa-clipboard-check" /> Quiz</h2>
      </div>

      <div v-if="quizzesStore.loading" class="loading"><i class="fa-solid fa-spinner fa-spin" /> Cargando quiz...</div>
      <div v-else>
        <div v-if="quizzesStore.error" class="error"><i class="fa-solid fa-triangle-exclamation" /> {{ errorText }}</div>
        <div v-if="!quizzesStore.currentQuiz" class="empty"><i class="fa-regular fa-face-meh" /> No hay quiz disponible para este curso.</div>
        <div v-else-if="blocked" class="hero fail">
          <div class="status">
            <i class="fa-solid fa-hourglass-half" />
            <span>No puedes iniciar aún</span>
          </div>
          <div class="retry" aria-live="polite">
            <span class="retry-label">Podrás reintentar en</span>
            <span class="countdown">{{ formatCountdown(remainingMs) }}</span>
          </div>
          <div class="actions">
            <button class="btn primary" type="button" @click="goToCourse">Volver al curso</button>
          </div>
        </div>
        <QuizRunner v-else :course-id="courseId" :user-id="userId" :quiz="quizzesStore.currentQuiz" @submitted="onSubmitted" />
      </div>
    </div>
  </div>
  <ExitIntentModal
    :open="exitOpen"
    :title="modalTitle"
    :message="modalMessage"
    primary-label="Entendido"
    secondary-label="Volver al curso"
    @close="closeModal"
    @stay="onModalStay"
    @leave="onModalLeave"
  />
  </template>

<style lang="scss" scoped>
.quiz-view {
  width: 100%;
  padding: 24px 16px;
  background: var(--bg);
  color: var(--text);
}

.container {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.head {
  display: grid;
  gap: 8px;
}

.title {
  color: var(--text);
  margin: 0;
  font-size: 22px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
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

.error { color: $alert-error; background: $alert-error-bg; border-color: rgba($alert-error, 0.3); margin: 8px 0 12px; }

.hero {
  display: grid;
  gap: 14px;
  align-content: start;
  text-align: center;
  border-radius: 16px;
  padding: 20px 16px;
  border: 1px solid var(--border);
}

.hero.fail {
  background: rgba($alert-error, 0.12);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
}

.retry {
  display: grid;
  gap: 6px;
  justify-items: center;
  color: var(--text);
}

.retry-label {
  font-size: 16px;
  opacity: 0.8;
}

.countdown {
  font-size: 32px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.02em;
}

.actions {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  justify-content: center;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

/* Se usa ExitIntentModal para el bloqueo; estilos locales eliminados */
@media (min-width: 960px) {
  .container {
    max-width: 980px;
  }
}
</style>

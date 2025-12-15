<<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzes'

const route = useRoute()
const router = useRouter()
const store = useQuizzesStore()

const courseId = computed(() => route.params.id as string)
const quizId = computed(() => route.params.quizId as (string | undefined))
const result = computed(() => store.lastResult)
const approvedAlready = computed(() => store.approvedAlready)
const retryAfterMs = computed(() => store.retryAfterMs)
const retryAvailableAt = computed(() => store.retryAvailableAt)
const errorMsg = computed(() => store.error)

const nowMs = ref(Date.now())
let timer: number | null = null
onMounted(() => { timer = window.setInterval(() => { nowMs.value = Date.now() }, 1000) })
onUnmounted(() => { if (timer) { clearInterval(timer); timer = null } })

const targetMs = computed(() => {
  const at = retryAvailableAt.value
  if (at) {
    const d = new Date(at)
    const t = d.getTime()
    if (!Number.isNaN(t)) return t
  }
  const base = Date.now()
  const add = retryAfterMs.value || 0
  return base + add
})
const remainingMs = computed(() => Math.max(targetMs.value - nowMs.value, 0))
const canRetry = computed(() => remainingMs.value <= 0)
const initialMs = ref(0)
onMounted(() => { initialMs.value = remainingMs.value })
const progressPct = computed(() => {
  const total = initialMs.value
  if (total <= 0) return 1
  const used = Math.min(Math.max(total - remainingMs.value, 0), total)
  return used / total
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

function goToCourse() {
  if (courseId.value) router.push(`/courses/${courseId.value}`)
}

function retryQuiz() {
  if (!courseId.value) return
  if (quizId.value) router.push(`/courses/${courseId.value}/quizzes/${quizId.value}`)
  else router.push(`/courses/${courseId.value}/quiz`)
}

function goBack() { router.back() }
</script>

<template>
  <div class="quiz-result">
    <div class="container">
      <div class="head">
        <button class="back" type="button" @click="goBack"><i class="fa-solid fa-arrow-left" /> Volver</button>
        <h2 class="title"><i class="fa-solid fa-flag-checkered" /> Resultado del quiz</h2>
      </div>

      <div v-if="!result && !approvedAlready && !retryAfterMs" class="empty">
        <i class="fa-regular fa-face-meh" /> No hay resultado para mostrar.
        <button class="cta" type="button" @click="retryQuiz">Volver al quiz</button>
      </div>

      <div v-else-if="approvedAlready" class="hero pass">
        <div class="status">
          <i class="fa-solid fa-circle-check" />
          <span>Ya aprobado</span>
        </div>
        <p class="rule"><i class="fa-solid fa-circle-info" /> Una vez aprobado, no es posible repetir el quiz.</p>
        <div class="actions">
          <button class="btn primary" type="button" @click="goToCourse">Volver al curso</button>
        </div>
      </div>

      <div v-else-if="result" class="hero" :class="{ pass: result.passed, fail: !result.passed }">
        <div class="status">
          <i v-if="result.passed" class="fa-solid fa-circle-check" />
          <i v-else class="fa-solid fa-circle-xmark" />
          <span>{{ result.passed ? 'Aprobado' : 'No aprobado' }}</span>
        </div>
        <div class="score">Puntaje: {{ result.score }}</div>
        <p class="rule"><i class="fa-solid fa-circle-info" /> Necesitas mínimo 9 respuestas correctas para aprobar.</p>
        <div v-if="!result.passed && retryAfterMs" class="retry">
          <i class="fa-solid fa-hourglass-half" /> Reintento disponible en: {{ formatCountdown(remainingMs) }}
          <span v-if="retryAvailableAt" class="retry-at">({{ new Date(retryAvailableAt).toLocaleString() }})</span>
          <div class="progress-row">
            <div class="progress"><div class="bar" :style="{ width: `${Math.round(progressPct * 100)}%` }" /></div>
            <div class="pct">{{ Math.round(progressPct * 100) }}%</div>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" type="button" @click="goToCourse">Volver al curso</button>
          <button class="btn secondary" type="button" :disabled="!canRetry" @click="retryQuiz">Reintentar quiz</button>
        </div>
      </div>

      <div v-else class="hero fail">
        <div class="status">
          <i class="fa-solid fa-hourglass-half" />
          <span>{{ errorMsg || 'No puedes reintentar aún' }}</span>
        </div>
        <div class="retry">
          Reintento disponible en: {{ formatCountdown(remainingMs) }}
          <span v-if="retryAvailableAt" class="retry-at">({{ new Date(retryAvailableAt).toLocaleString() }})</span>
          <div class="progress-row">
            <div class="progress"><div class="bar" :style="{ width: `${Math.round(progressPct * 100)}%` }" /></div>
            <div class="pct">{{ Math.round(progressPct * 100) }}%</div>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" type="button" @click="goToCourse">Volver al curso</button>
          <button class="btn secondary" type="button" :disabled="!canRetry" @click="retryQuiz">Reintentar quiz</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quiz-result { width: 100%; padding: 24px 16px; background: var(--bg); color: var(--text); }
.container { max-width: 100%; margin: 0 auto; display: grid; gap: 16px; }
.head { display: grid; gap: 8px; }
.title { color: var(--text); margin: 0; font-size: 22px; display: inline-flex; align-items: center; gap: 10px; }
.back { background: none; border: none; color: var(--accent); display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }

.empty { display: grid; gap: 12px; align-content: start; color: color-mix(in oklab, var(--text), transparent 40%); background: color-mix(in oklab, var(--bg), var(--text) 6%); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.empty .cta { justify-self: start; background: var(--accent); color: var(--bg); border: none; border-radius: 999px; padding: 10px 14px; cursor: pointer; }

.hero { display: grid; gap: 14px; align-content: start; text-align: center; border-radius: 16px; padding: 20px 16px; border: 1px solid var(--border); }
.hero.pass { background: rgba($alert-success, 0.12); }
.hero.fail { background: rgba($alert-error, 0.12); }

.status { display: inline-flex; align-items: center; gap: 10px; justify-content: center; font-weight: 700; font-size: 20px; }
.hero.pass .status { color: $alert-success; }
.hero.fail .status { color: $alert-error; }

.score { font-size: 16px; color: color-mix(in oklab, var(--text), transparent 30%); }

.rule { margin: 0; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; justify-content: center; color: color-mix(in oklab, var(--text), transparent 20%); }

.retry { display: inline-flex; align-items: center; gap: 8px; justify-content: center; font-size: 14px; color: color-mix(in oklab, var(--text), transparent 10%); }
.retry-at { opacity: 0.8; }

.progress { width: 100%; max-width: 420px; height: 8px; border-radius: 999px; background: color-mix(in oklab, var(--bg), var(--text) 10%); overflow: hidden; margin-top: 6px; }
.bar { height: 100%; background: var(--accent); }
.progress-row { width: 100%; max-width: 520px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; }
.pct { font-size: 12px; color: color-mix(in oklab, var(--text), transparent 30%); }

.actions { display: grid; gap: 10px; grid-template-columns: 1fr; }
.btn { display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 999px; padding: 10px 14px; cursor: pointer; font-size: 14px; justify-content: center; }
.btn.primary { background: var(--accent); color: var(--bg); }
.btn.secondary { background: color-mix(in oklab, var(--bg), var(--text) 6%); color: var(--text); border: 1px solid var(--border); }

@media (min-width: 960px) {
  .container { max-width: 980px; }
  .hero { padding: 32px; }
  .actions { grid-template-columns: repeat(2, 1fr); }
}
</style>
>

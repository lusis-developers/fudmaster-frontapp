<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useCoursesStore } from '@/stores/courses'

const store = useCoursesStore()

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(course: any) {
  return sanitizeUrl(course.image_url) || sanitizeUrl(course.coverUrl) || '/src/assets/fudmaster-color.png'
}

function normalize(text?: string) { return (text || '').toString().trim().toLowerCase() }
const activeName = 'primeros pasos en meta ads'
function isActive(course: any) {
  return normalize(course?.name || course?.title) === activeName
}

function truncated(text: string, limit = 140) {
  const t = (text || '').trim()
  if (t.length <= limit) return { short: t, needs: false }
  const short = t.slice(0, limit).replace(/\s+\S*$/, '') + '…'
  return { short, needs: true }
}

const tick = ref<number>(Date.now())
const deadlines = ref<number[]>([])

function endOfNextSunday(): Date {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = (7 - day)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59)
}

function cycleDeadline(weeks: number): number {
  const base = endOfNextSunday()
  base.setDate(base.getDate() + 7 * (weeks - 1))
  return base.getTime()
}

function initDeadlines(count: number) {
  deadlines.value = Array.from({ length: count }, (_, i) => cycleDeadline((i % 4) + 1))
}

function resetAllToOneWeek() {
  const t = cycleDeadline(1)
  deadlines.value = deadlines.value.map(() => t)
}

function pixelStyle(i: number) {
  const hues = [120, 200, 20, 280]
  const h = hues[i % hues.length]
  return {
    '--c1': `hsla(${h}, 60%, 60%, 0.18)`,
    '--c2': `hsla(${h}, 40%, 40%, 0.14)`,
    '--c3': `hsla(${h}, 30%, 30%, 0.10)`,
  } as Record<string, string>
}

onMounted(() => {
  store.fetchAll()
})

watch(() => store.courses, (list) => {
  initDeadlines(Array.isArray(list) ? list.length : 0)
}, { immediate: true })

window.setInterval(() => {
  tick.value = Date.now()
  if (deadlines.value.some(ms => ms - tick.value <= 0)) {
    resetAllToOneWeek()
  }
}, 1000)
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
          <RouterLink v-for="(c, i) in store.courses" :key="c._id || c.id" class="card" :to="`/courses/${c.id}`" :class="{ disabled: !isActive(c) }">
            <div class="cover" v-if="isActive(c)">
              <img :src="coverOf(c)" alt="cover" />
            </div>
            <div v-else class="cover pixelated" :style="pixelStyle(i)"></div>
            <div class="info">
              <h3 class="name">{{ c.name || c.title || 'Curso sin título' }}</h3>
              <p class="desc">
                <span>{{ truncated(c.heading || c.description || c.shortDescription || 'Detalles próximamente.', 140).short }}</span>
              </p>
            </div>
            <div class="meta">
              <span class="status" :class="isActive(c) ? 'published' : 'upcoming'">{{ isActive(c) ? 'Publicado' : 'Próximamente' }}</span>
              <span class="cta" :class="{ disabled: !isActive(c) }">
                {{ isActive(c) ? 'Ver curso' : 'Muy pronto' }}
                <i v-if="isActive(c)" class="fa-solid fa-arrow-right" />
              </span>
            </div>
            <div v-if="!isActive(c)" class="countdown">
              <span class="label">Disponible en:</span>
              <span class="unit">{{ String(Math.floor(((deadlines[i] ?? tick) - tick) / (1000 * 60 * 60 * 24))).padStart(2, '0') }}d</span>
              <span class="sep">:</span>
              <span class="unit">{{ String(Math.floor((((deadlines[i] ?? tick) - tick) / (1000 * 60 * 60)) % 24)).padStart(2, '0') }}h</span>
              <span class="sep">:</span>
              <span class="unit">{{ String(Math.floor((((deadlines[i] ?? tick) - tick) / (1000 * 60)) % 60)).padStart(2, '0') }}m</span>
              <span class="sep">:</span>
              <span class="unit">{{ String(Math.floor((((deadlines[i] ?? tick) - tick) / 1000) % 60)).padStart(2, '0') }}s</span>
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
.card.disabled { pointer-events: none; opacity: 0.7; }

.cover img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.cover.pixelated {
  --c1: rgba($FUDMASTER-GREEN, 0.15);
  --c2: rgba($FUDMASTER-DARK, 0.12);
  --c3: rgba($FUDMASTER-DARK, 0.06);
  background-image:
    repeating-linear-gradient(0deg, var(--c1) 0 12px, var(--c2) 12px 24px),
    repeating-linear-gradient(90deg, var(--c3) 0 12px, transparent 12px 24px);
  background-size: 24px 24px;
  width: 100%;
  height: 160px;
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

.countdown { padding: 12px; border-top: 1px dashed rgba($FUDMASTER-DARK, 0.08); display: inline-flex; align-items: center; gap: 6px; font-family: monospace; font-weight: 700; color: $FUDMASTER-DARK; }
.countdown .label { font-size: 12px; color: rgba($FUDMASTER-DARK, 0.6); margin-right: 4px; }
.countdown .unit { background: rgba($FUDMASTER-GREEN, 0.1); padding: 4px 6px; border-radius: 6px; min-width: 36px; text-align: center; }
.countdown .sep { color: rgba($FUDMASTER-DARK, 0.4); }

.meta {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 12px;
}
.status { border-radius: 999px; padding: 4px 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
.status.published { background: rgba($FUDMASTER-GREEN, 0.12); border: 1px solid rgba($FUDMASTER-GREEN, 0.4); color: $FUDMASTER-GREEN; }
.status.upcoming { background: $overlay-purple; color: $FUDMASTER-BLUE; border: 1px solid rgba($FUDMASTER-DARK, 0.06); }
.cta { background: $FUDMASTER-PINK; color: $white; border-radius: 999px; padding: 6px 10px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
.cta.disabled { background: $FUDMASTER-LIGHT; color: rgba($FUDMASTER-DARK, 0.5); border: 1px solid rgba($FUDMASTER-DARK, 0.08); }
</style>

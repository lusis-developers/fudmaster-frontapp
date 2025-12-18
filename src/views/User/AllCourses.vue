<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'
import { makePlaceholders } from '@/mocks/courses.mock'

const store = useCoursesStore()
const userStore = useUserStore()
const router = useRouter()

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(course: any) {
  return sanitizeUrl(course.image_url) || sanitizeUrl(course.coverUrl) || '/src/assets/fudmaster-color.png'
}

function isActive(course: any) {
  return !!course?.is_published
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
  const pattern = [1, 2, 4] as const
  deadlines.value = Array.from({ length: count }, (_, i) => {
    const idx = (i % pattern.length) as 0 | 1 | 2
    return cycleDeadline(pattern[idx])
  })
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

const displayCourses = computed(() => {
  const list = Array.isArray(store.courses) ? store.courses : []
  const need = Math.max(0, 12 - list.length)
  const placeholders = makePlaceholders(need)
  return [...list, ...placeholders]
})

const isFreeUser = computed(() => {
  if (!userStore.id) userStore.hydrate()
  return userStore.accountType === 'free'
})

const modalOpen = ref(false)
const modalTitle = ref('')
function openUpcoming(c: any) { modalTitle.value = String(c?.name || c?.title || 'Próximamente'); modalOpen.value = true }
function closeModal() { modalOpen.value = false }

watch(displayCourses, (list) => {
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
      <p class="subtitle">Explora y descubre todos nuestros cursos disponibles.</p>
      <div class="upcoming-notice">
        <i class="fa-regular fa-bell" /> Pronto estarán disponibles más cursos durante este mes.
      </div>
      
      <!-- CTA para usuarios Free -->
      <div v-if="isFreeUser" class="upgrade-banner" @click="router.push('/checkout')">
        <div class="upgrade-content">
          <div class="upgrade-icon">
            <i class="fa-solid fa-crown" />
          </div>
          <div class="upgrade-text">
            <h3>Hazte Founder</h3>
            <p>Accede a todos los cursos y contenido exclusivo.</p>
          </div>
        </div>
        <button class="upgrade-btn">
          Obtener Acceso
          <i class="fa-solid fa-arrow-right" />
        </button>
      </div>

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
          <RouterLink v-for="(c, i) in displayCourses" :key="c._id || c.id" class="card" :to="`/courses/${c.id}`" :class="{ disabled: !isActive(c) }" @click.prevent="!isActive(c) && openUpcoming(c)">
            <div class="cover" v-if="isActive(c)">
              <img :src="coverOf(c)" alt="cover" />
            </div>
            <div v-else>
              <img v-if="coverOf(c)" :src="coverOf(c)" alt="cover" class="blur-cover" />
              <div v-else class="cover pixelated" :style="pixelStyle(i)"></div>
            </div>
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
        <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <h3 class="modal-title"><i class="fa-solid fa-hourglass-half" /> {{ modalTitle }}</h3>
            <p class="modal-desc">Este curso estará disponible pronto. Gracias por tu interés.</p>
            <button class="modal-btn" type="button" @click="closeModal">Entendido</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.all-courses {
  width: 100%;
  padding: 24px 16px;
  background: var(--bg);
  color: var(--text);
}

.container {
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

.title {
  color: var(--text);
  font-size: 24px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  color: color-mix(in oklab, var(--text), transparent 40%);
  margin: 0;
}

.upcoming-notice {
  background: color-mix(in oklab, var(--accent), transparent 92%);
  color: var(--accent);
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.upgrade-banner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 165, 0, 0.15);
    
    .upgrade-btn {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    
    .upgrade-btn {
      width: 100%;
      justify-content: center;
    }
  }
}

.upgrade-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #000;
  flex-shrink: 0;
}

.upgrade-text {
  h3 {
    margin: 0;
    font-size: 18px;
    color: var(--text);
  }
  
  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: color-mix(in oklab, var(--text), transparent 30%);
  }
}

.upgrade-btn {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  border: none;
  border-radius: 99px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
  white-space: nowrap;
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

.card { background: var(--bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; display: grid; text-decoration: none; transition: border-color 0.2s ease, transform 0.2s ease; }
.card.disabled { opacity: 0.7; }

.cover img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.blur-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  filter: blur(6px);
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
  color: var(--text);
  margin: 0;
  font-size: 18px;
}

.desc {
  color: color-mix(in oklab, var(--text), transparent 40%);
  margin: 0;
  font-size: 14px;
}

.countdown { padding: 12px; border-top: 1px dashed var(--border); display: inline-flex; align-items: center; gap: 6px; font-family: monospace; font-weight: 700; color: var(--text); }
.countdown .label { font-size: 12px; color: color-mix(in oklab, var(--text), transparent 60%); margin-right: 4px; }
.countdown .unit { background: color-mix(in oklab, var(--accent), transparent 88%); color: var(--accent); padding: 4px 6px; border-radius: 6px; min-width: 36px; text-align: center; }
.countdown .sep { color: color-mix(in oklab, var(--text), transparent 60%); }

.meta {
  padding: 12px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: color-mix(in oklab, var(--text), transparent 40%);
  display: flex;
  align-items: center;
  gap: 12px;
}
.status { border-radius: 999px; padding: 4px 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
.status.published { background: color-mix(in oklab, var(--accent), transparent 88%); border: 1px solid var(--border); color: var(--accent); }
.status.upcoming { background: $overlay-purple; color: $FUDMASTER-BLUE; border: 1px solid var(--border); }
.cta { background: var(--accent); color: $white; border-radius: 999px; padding: 6px 10px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
.cta.disabled { background: color-mix(in oklab, var(--bg), var(--text) 6%); color: color-mix(in oklab, var(--text), transparent 50%); border: 1px solid var(--border); }
.card:hover { border-color: var(--accent); transform: translateY(-1px); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; width: min(480px, 92vw); display: grid; gap: 12px; color: var(--text); box-shadow: 0 12px 40px rgba(0,0,0,0.25); }
.modal-title { margin: 0; font-size: 18px; display: inline-flex; align-items: center; gap: 8px; color: var(--text); }
.modal-desc { margin: 0; color: color-mix(in oklab, var(--text), transparent 40%); }
.modal-btn { background: var(--accent); color: $white; border: none; border-radius: 999px; padding: 10px 14px; font-weight: 700; cursor: pointer; justify-self: end; }
</style>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'
import UpgradeBanner from '@/components/UpgradeBanner.vue'
import CourseCard from '@/components/CourseCard.vue'
import { makePlaceholders } from '@/mocks/courses.mock'

const store = useCoursesStore()
const userStore = useUserStore()

/* helpers no longer needed here */

/* presentation handled by CourseCard */

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  return (userStore.id as any) || ''
})

const query = ref('')
const modalOpen = ref(false)
const modalTitle = ref('')

const sourceCourses = computed(() => (store.enrolledCourses.length ? store.enrolledCourses : store.courses))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sourceCourses.value
  return sourceCourses.value.filter((c: any) => {
    const text = [c?.name, c?.title, c?.heading, c?.description, c?.shortDescription].join(' ').toLowerCase()
    return text.includes(q)
  })
})

const liveList = computed(() => Array.isArray(filtered.value) ? filtered.value : [])
const upcoming = computed(() => makePlaceholders(6))


function openModal(c: any) {
  modalTitle.value = String(c?.name || 'Próximamente')
  modalOpen.value = true
}
function closeModal() { modalOpen.value = false }

function cycleDeadline(weeks: number): number {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = (7 - day)
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59)
  base.setDate(base.getDate() + 7 * (weeks - 1))
  return base.getTime()
}

function countdownForIndex(i: number): number {
  const pattern = [1, 2, 4] as const
  const idx = (i % pattern.length) as 0 | 1 | 2
  return cycleDeadline(pattern[idx])
}

onMounted(() => {
  if (userId.value) {
    store.fetchEnrolled(userId.value)
  } else {
    store.fetchAll({ scope: 'mine' })
  }
})
</script>

<template>
  <div class="my-courses">
    <div class="container">
      <div class="header">
        <h2 class="title"><i class="fa-solid fa-book" /> Mis cursos</h2>
      <div class="actions">
        <input v-model="query" type="search" placeholder="Buscar cursos" class="search" />
      </div>
      </div>
      <p class="subtitle">Explora y continúa tu aprendizaje. Usa el buscador para encontrar cursos.</p>
      <div class="upcoming-notice">
        <i class="fa-regular fa-bell" /> Pronto estarán disponibles más cursos durante este mes.
      </div>

      <UpgradeBanner />

      <div v-if="store.loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin" /> Cargando cursos...
      </div>

      <div v-else-if="store.error" class="error">
        <i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}
      </div>

      <div v-else>
        <div v-if="(store.enrolledCourses.length || store.courses.length) === 0" class="empty">
          <i class="fa-regular fa-face-smile" />
          <span>Aún no tienes cursos asignados.</span>
        </div>
        <div v-else class="cards">
          <CourseCard
            v-for="c in liveList"
            :key="c.id"
            :course="c"
            :to="`/courses/${c.id}`"
            :show-published-badge="true"
            :show-classes-count="true"
          />
        </div>
        <h3 class="subtitle">Próximamente</h3>
        <div class="cards">
          <CourseCard
            v-for="(c, i) in upcoming"
            :key="c.id"
            :course="c"
            :disabled="true"
            :countdown-to="countdownForIndex(i)"
            :show-published-badge="true"
            :show-classes-count="true"
            @placeholder-click="openModal(c)"
          />
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
.my-courses { width: 100%; padding: 24px 16px; background: var(--bg); color: var(--text); }

.container {
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

.header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title {
  color: var(--text);
  padding: 24px 0;
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

.actions { display: flex; align-items: center; gap: 10px; }
.search { background: color-mix(in oklab, var(--text), transparent 94%); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 220px; }
.search::placeholder { color: color-mix(in oklab, var(--text), transparent 50%); }

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

.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; width: min(480px, 92vw); display: grid; gap: 12px; color: var(--text); box-shadow: 0 12px 40px rgba(0,0,0,0.25); }
.modal-title { margin: 0; font-size: 18px; display: inline-flex; align-items: center; gap: 8px; color: var(--text); }
.modal-desc { margin: 0; color: color-mix(in oklab, var(--text), transparent 40%); }
.modal-btn { background: var(--accent); color: $white; border: none; border-radius: 999px; padding: 10px 14px; font-weight: 700; cursor: pointer; justify-self: end; }

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

/* cards now use CourseCard component styling */
</style>

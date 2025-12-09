<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'

const store = useCoursesStore()
const userStore = useUserStore()

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(course: any) {
  return sanitizeUrl(course.image_url) || sanitizeUrl(course.coverUrl) || '/src/assets/fudmaster-color.png'
}

function classesCount(course: any) {
  const sections = Array.isArray(course?.lecture_sections) ? course.lecture_sections : []
  if (sections.length) {
    let total = 0
    for (const s of sections) total += (Array.isArray(s?.lectures) ? s.lectures.length : 0)
    return total
  }
  return Number(course?.lecturesCount ?? (Array.isArray(course?.lectures) ? course.lectures.length : 0) ?? 0)
}

function descriptionOf(course: any) {
  return course?.heading || course?.description || course?.shortDescription || 'Detalles próximamente.'
}

function truncated(text: string, limit = 140) {
  const t = (text || '').trim()
  if (t.length <= limit) return { short: t, needs: false }
  const short = t.slice(0, limit).replace(/\s+\S*$/, '') + '…'
  return { short, needs: true }
}

const expanded = ref<Record<string | number, boolean>>({})
function isExpanded(course: any) { return !!expanded.value[String(course._id || course.id)] }
function toggleExpanded(course: any) { const key = String(course._id || course.id); expanded.value[key] = !expanded.value[key] }

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  return (userStore.id as any) || ''
})

const query = ref('')

const sourceCourses = computed(() => (store.enrolledCourses.length ? store.enrolledCourses : store.courses))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sourceCourses.value
  return sourceCourses.value.filter((c: any) => {
    const text = [c?.name, c?.title, c?.heading, c?.description, c?.shortDescription].join(' ').toLowerCase()
    return text.includes(q)
  })
})

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
          <RouterLink v-for="c in filtered" :key="c._id || c.id" class="card" :to="`/courses/${c.id}`">
            <div class="cover">
              <img :src="coverOf(c)" alt="cover" />
            </div>
            <div class="info">
              <h3 class="name">{{ c.name || c.title || 'Curso sin título' }}</h3>
              <p class="desc">
                <span v-if="isExpanded(c)">{{ descriptionOf(c) }}</span>
                <span v-else>{{ truncated(descriptionOf(c), 140).short }}</span>
                <button
                  v-if="truncated(descriptionOf(c), 140).needs"
                  type="button"
                  class="read-more"
                  @click.stop.prevent="toggleExpanded(c)"
                >{{ isExpanded(c) ? 'Leer menos' : 'Leer más' }}</button>
              </p>
            </div>
            <div class="meta">
              <span class="badge"><i class="fa-solid fa-clapperboard" /> {{ classesCount(c) }} clases</span>
              <span class="cta">Ver curso <i class="fa-solid fa-arrow-right" /></span>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.my-courses { width: 100%; padding: 24px 16px; background: $white; }

.container {
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

.header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title {
  color: $FUDMASTER-DARK;
  font-size: 24px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  color: rgba($FUDMASTER-DARK, 0.6);
  margin: 0;
}

.actions { display: flex; align-items: center; gap: 10px; }
.search { background: rgba($FUDMASTER-DARK, 0.06); border: 1px solid rgba($FUDMASTER-DARK, 0.12); color: $FUDMASTER-DARK; border-radius: 10px; padding: 10px 12px; font-size: 14px; width: 220px; }
.search::placeholder { color: rgba($FUDMASTER-DARK, 0.5); }

.loading,
.error,
.empty {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba($FUDMASTER-DARK, 0.6);
  background: $FUDMASTER-LIGHT;
  border: 1px solid rgba($FUDMASTER-DARK, 0.08);
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

.card {
  background: $white;
  border: 1px solid rgba($FUDMASTER-DARK, 0.08);
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

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
  color: rgba($FUDMASTER-DARK, 0.6);
  margin: 0;
  font-size: 14px;
}

.read-more { background: none; border: none; color: $FUDMASTER-BLUE; font-weight: 600; cursor: pointer; padding: 0; margin-left: 6px; }

.meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px; border-top: 1px solid rgba($FUDMASTER-DARK, 0.06); }
.badge { background: $overlay-purple; color: $FUDMASTER-BLUE; border: 1px solid rgba($FUDMASTER-DARK, 0.06); border-radius: 999px; padding: 4px 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
.cta { background: $FUDMASTER-PINK; color: $white; border-radius: 999px; padding: 6px 10px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
.card:hover { border-color: $FUDMASTER-BLUE; transform: translateY(-1px); }
</style>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'
import CourseCard from '@/components/CourseCard.vue'

const store = useCoursesStore()
const userStore = useUserStore()

/* helpers no longer needed here */

/* presentation handled by CourseCard */

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
          <CourseCard
            v-for="c in filtered"
            :key="c._id || c.id"
            :course="c"
            :to="`/courses/${c.id}`"
            :show-published-badge="true"
            :show-classes-count="true"
          />
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

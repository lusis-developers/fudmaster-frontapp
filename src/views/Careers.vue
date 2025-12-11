<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useCareersStore } from '@/stores/careers'
import { useUserStore } from '@/stores/user'
import { useCoursesStore } from '@/stores/courses'

const store = useCareersStore()
const userStore = useUserStore()
const coursesStore = useCoursesStore()

onMounted(async () => {
  await store.fetchAll()
  userStore.hydrate()
  const uid = userStore.id || localStorage.getItem('user_id')
  if (uid) await store.fetchUserCareers(String(uid))
})

const careers = computed(() => store.careers)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

const userCareerIds = computed(() => {
  const list = Array.isArray(store.userCareers) ? store.userCareers : []
  return new Set(list.map((c: any) => String(c?.info?._id || c?.access?.careerId || '')))
})

const myCareers = computed(() => {
  const list = Array.isArray(store.userCareers) ? store.userCareers : []
  return list.map((c: any) => c?.info || c?.access).filter(Boolean)
})

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function coverOf(career: any) {
  return sanitizeUrl(career?.imageUrl) || '/src/assets/fudmaster-color.png'
}

function coursesCount(career: any) {
  const ids = Array.isArray(career?.courseIds) ? career.courseIds : []
  return ids.length
}

function isInMyCareers(career: any) {
  return userCareerIds.value.has(String(career?._id))
}

async function addToMyCareers(career: any) {
  const uid = userStore.id || localStorage.getItem('user_id')
  if (!uid || !career?._id) return
  const res = await store.assignToUser(String(career._id), String(uid), { autoEnroll: true, teachableUserId: userStore.teachableUserId || undefined })
  if (res) {
    await store.fetchUserCareers(String(uid))
    await coursesStore.fetchEnrolled(String(uid))
  }
}
</script>

<template>
  <div class="careers-view">
    <div class="container">
      <div class="head">
        <h2 class="title"><i class="fa-solid fa-graduation-cap" /> Escuelas o Carreras</h2>
      </div>

      <div v-if="loading" class="hint">Cargando carreras…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else>
        <h3 class="subtitle">Mis carreras</h3>
        <div class="grid">
          <div v-if="myCareers.length === 0" class="empty">Aún no tienes carreras asignadas.</div>
          <div v-for="c in myCareers" :key="c._id || c.careerId" class="card">
            <RouterLink :to="`/careers/${c._id || c.careerId}`">
              <img class="cover" :src="coverOf(c)" alt="cover" />
              <h3 class="name">{{ c.name }}</h3>
              <p class="desc">{{ c.description || 'Detalles próximamente.' }}</p>
            </RouterLink>
            <div class="meta">
              <span class="badge">{{ coursesCount(c) }} curso(s)</span>
              <span class="badge" :class="{ active: c.isActive }">{{ c.isActive ? 'Activa' : 'Inactiva' }}</span>
              <button class="add-button" disabled>Agregada</button>
            </div>
          </div>
        </div>

        <h3 class="subtitle">Todas las carreras</h3>
        <div class="grid">
          <div v-for="c in careers" :key="c._id" class="card">
            <RouterLink :to="`/careers/${c._id}`">
              <img class="cover" :src="coverOf(c)" alt="cover" />
              <h3 class="name">{{ c.name }}</h3>
              <p class="desc">{{ c.description || 'Detalles próximamente.' }}</p>
            </RouterLink>
            <div class="meta">
              <span class="badge">{{ coursesCount(c) }} curso(s)</span>
              <span class="badge" :class="{ active: c.isActive }">{{ c.isActive ? 'Activa' : 'Inactiva' }}</span>
              <button class="add-button" :disabled="isInMyCareers(c)" @click="addToMyCareers(c)">
                {{ isInMyCareers(c) ? 'Agregada' : 'Agregar a mis carreras' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  </template>

<style lang="scss" scoped>
.careers-view { width: 100%; padding: 24px 16px; background: var(--bg); color: var(--text); }
.container { width: 100%; margin: 0 auto; display: grid; gap: 16px; }
.head { display: flex; align-items: center; justify-content: space-between; }
.title { display: inline-flex; align-items: center; gap: 10px; color: var(--text); margin: 0; font-size: 22px; }
.subtitle { color: var(--text); margin: 8px 0; font-size: 18px; }
.hint { color: color-mix(in oklab, var(--text), transparent 40%); }
.error { color: var(--accent); }
.grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(3, 1fr); } }
.card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 14px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); display: grid; gap: 8px; }
.cover { width: 100%; height: 130px; border-radius: 8px; object-fit: cover; }
.name { color: var(--text); font-weight: 700; margin: 0; }
.desc { color: color-mix(in oklab, var(--text), transparent 30%); margin: 0; font-size: 14px; }
.meta { display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; }
.badge { background: color-mix(in oklab, var(--accent), transparent 85%); color: var(--text); border-radius: 6px; padding: 6px 8px; font-size: 12px; }
.badge.active { background: color-mix(in oklab, var(--accent), transparent 70%); font-weight: 700; }
.add-button { background: var(--accent); color: $white; border: none; border-radius: 8px; padding: 6px 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.add-button[disabled] { background: color-mix(in oklab, var(--accent), transparent 40%); cursor: default; }
.empty { color: color-mix(in oklab, var(--text), transparent 40%); }
</style>

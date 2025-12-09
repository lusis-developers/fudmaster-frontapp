<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import CommentsThread from '@/components/CommentsThread.vue'
import LectureVideoPlayer from '@/components/lecture/LectureVideoPlayer.vue'
import LectureAttachments from '@/components/lecture/LectureAttachments.vue'
import LectureTabs from '@/components/lecture/LectureTabs.vue'

const route = useRoute()
const router = useRouter()
const store = useCoursesStore()

const courseId = computed(() => route.params.id as string)
const lectureId = computed(() => route.params.lectureId as string)

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

function findVideoUrl() {
  const att = (store.currentLecture?.attachments || []).find((a: any) => a?.kind === 'video' && a?.url)
  return sanitizeUrl(att?.url)
}

const currentUrl = computed(() => findVideoUrl())

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

function goToLecture(id: string | number) {
  if (!courseId.value || !id) return
  router.push(`/courses/${courseId.value}/lectures/${id}`)
}

function goBack() { router.back() }

onMounted(async () => {
  if (courseId.value) await store.fetchById(courseId.value)
  if (courseId.value && lectureId.value) await store.fetchLecture(courseId.value, lectureId.value)
})
</script>

<template>
  <div class="lecture-detail-view">
    <div class="container">
      <div class="header">
        <button class="back" type="button" @click="goBack"><i class="fa-solid fa-arrow-left" /> Volver</button>
        <h2 class="title"><i class="fa-solid fa-chalkboard" /> {{ store.currentLecture?.name || 'Clase' }}</h2>
        <p class="meta">Posición {{ store.currentLecture?.position ?? '-' }} · {{ store.currentLecture?.is_published ? 'Publicada' : 'Borrador' }}</p>
      </div>

      <div v-if="store.loading" class="loading"><i class="fa-solid fa-spinner fa-spin" /> Cargando clase...</div>
      <div v-else-if="store.error" class="error"><i class="fa-solid fa-triangle-exclamation" /> {{ store.error }}</div>
      <div v-else-if="!store.currentLecture" class="empty"><i class="fa-regular fa-face-meh" /> No se encontró la clase.</div>

      <div v-else class="lesson-layout">
        <div class="left">
          <div class="player-wrap">
            <LectureVideoPlayer :video-url="currentUrl" />
          </div>
          <LectureTabs :description="store.currentLecture?.description || store.currentLecture?.heading" :has-resources="Array.isArray(store.currentLecture?.attachments) && store.currentLecture.attachments.length > 0">
            <template #resources>
              <LectureAttachments v-if="Array.isArray(store.currentLecture?.attachments) && store.currentLecture.attachments.length" :attachments="store.currentLecture.attachments" />
            </template>
          </LectureTabs>
          <div v-if="nextLecture" class="next-panel">
            <div class="next-head">
              <h3 class="next-title"><i class="fa-solid fa-forward" /> Siguiente clase</h3>
              <p class="next-meta">{{ nextLecture.name || `Lección ${nextLecture.position}` }}</p>
            </div>
            <div class="next-actions">
              <button class="next-cta" type="button" @click="goToLecture(nextLecture.id)"><i class="fa-solid fa-check" /> Continuar</button>
            </div>
          </div>
        </div>
        <div class="right">
          <aside class="comments-sidebar">
            <CommentsThread :course-id="Number(courseId)" :lecture-id="Number(lectureId)" :show-title="false" />
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lecture-detail-view { width: 100%; padding: 24px 16px; background: $white; }
.container { max-width: 100%; margin: 0 auto; display: grid; gap: 16px; }
.header { display: grid; gap: 8px; }
.back { background: none; border: none; color: $FUDMASTER-GREEN; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
.title { color: $FUDMASTER-DARK; margin: 0; font-size: 24px; display: inline-flex; align-items: center; gap: 10px; }
.meta { color: rgba($FUDMASTER-DARK, 0.6); margin: 0; font-size: 14px; }
.loading, .error, .empty { display: inline-flex; align-items: center; gap: 10px; color: rgba($FUDMASTER-DARK, 0.6); background: $FUDMASTER-LIGHT; border: 1px solid rgba($FUDMASTER-DARK, 0.08); border-radius: 10px; padding: 12px 14px; }
.error { color: $alert-error; background: $alert-error-bg; border-color: rgba($alert-error, 0.3); }
.lesson-layout { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 960px) { .lesson-layout { grid-template-columns: 1.4fr 1fr; } }
@media (min-width: 1280px) { .lesson-layout { grid-template-columns: 1.8fr 1fr; } }
.left { display: grid; gap: 16px; }
.right { display: grid; gap: 16px; }
.player-wrap { background: $FUDMASTER-DARK; border-radius: 12px; box-shadow: 0 20px 40px -10px rgba($FUDMASTER-DARK, 0.1); overflow: hidden; }
.next-panel { background: $white; border: 1px solid rgba($FUDMASTER-DARK, 0.08); border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
.next-head { display: grid; gap: 6px; }
.next-title { color: $FUDMASTER-DARK; margin: 0; font-size: 18px; display: inline-flex; align-items: center; gap: 8px; }
.next-meta { color: rgba($FUDMASTER-DARK, 0.6); margin: 0; font-size: 14px; }
.next-actions { display: flex; justify-content: flex-end; }
.next-cta { background: $FUDMASTER-PINK; color: $white; border: none; border-radius: 999px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
.next-cta:hover { filter: brightness(0.95); }

.comments-sidebar { background: $white; border: 1px solid rgba($FUDMASTER-DARK, 0.08); border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
</style>

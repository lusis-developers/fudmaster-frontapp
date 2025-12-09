<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import CommentsThread from '@/components/CommentsThread.vue'

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

function canPlay(url: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(url)
}

function videoMime(url: string) {
  const u = url.toLowerCase()
  if (u.endsWith('.mp4')) return 'video/mp4'
  if (u.endsWith('.webm')) return 'video/webm'
  if (u.endsWith('.mov')) return 'video/quicktime'
  if (u.endsWith('.m4v')) return 'video/mp4'
  return 'video/mp4'
}

function isSupported(url: string) {
  try {
    const mime = videoMime(url)
    const v = document.createElement('video')
    const res = v.canPlayType(mime)
    return !!res
  } catch (_) {
    return false
  }
}

const playSrc = ref('')
const blobUrl = ref('')
const blobLoading = ref(false)
const blobError = ref('')
const videoReady = ref(false)

async function loadBlob(url: string) {
  blobLoading.value = true
  blobError.value = ''
  try {
    const res = await fetch(url, { mode: 'cors' })
    const b = await res.blob()
    blobUrl.value = URL.createObjectURL(b)
    playSrc.value = blobUrl.value
  } catch (e: any) {
    blobError.value = e?.message || 'No se pudo cargar el video'
    playSrc.value = sanitizeUrl(url)
  } finally {
    blobLoading.value = false
  }
}

function resetBlob() {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value)
  blobUrl.value = ''
}

const currentUrl = computed(() => findVideoUrl())

watch(currentUrl, async (u) => {
  resetBlob()
  playSrc.value = ''
  videoReady.value = false
  if (!u) return
  const url = sanitizeUrl(u)
  const extMov = url.toLowerCase().endsWith('.mov')
  const supported = isSupported(url) && canPlay(url)
  if (supported && !extMov) {
    playSrc.value = url
    return
  }
  await loadBlob(url)
})

onUnmounted(() => {
  resetBlob()
})

function goBack() { router.back() }

onMounted(async () => {
  if (courseId.value && lectureId.value) {
    await store.fetchLecture(courseId.value, lectureId.value)
  }
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

      <div v-else class="player-card">
        <div class="player">
          <template v-if="currentUrl">
            <div v-if="blobLoading" class="loading-player"><i class="fa-solid fa-spinner fa-spin" /> Cargando video...</div>
            <template v-else-if="playSrc || (canPlay(currentUrl) && isSupported(currentUrl))">
              <div class="player-box">
                <video controls controlsList="nodownload" playsinline preload="metadata" class="video" @loadedmetadata="videoReady = true" @canplay="videoReady = true" @canplaythrough="videoReady = true">
                  <source :src="playSrc || currentUrl" :type="videoMime(playSrc || currentUrl)" />
                </video>
                <div v-if="!videoReady" class="loading-overlay"><i class="fa-solid fa-spinner fa-spin" /> Preparando video...</div>
              </div>
            </template>
            <template v-else>
              <div class="fallback">
                <i class="fa-solid fa-film" />
                <span>Formato no compatible para reproducción directa.</span>
                <a :href="findVideoUrl()" target="_blank" rel="noopener noreferrer" class="open"><i class="fa-solid fa-play" /> Abrir video</a>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="empty-video"><i class="fa-regular fa-circle-play" /> Esta clase no tiene video disponible.</div>
          </template>
        </div>

        <div class="attachments" v-if="Array.isArray(store.currentLecture?.attachments) && store.currentLecture.attachments.length">
          <h3 class="attachments-title"><i class="fa-solid fa-paperclip" /> Recursos</h3>
          <ul class="list">
            <li v-for="a in store.currentLecture.attachments" :key="a.id" class="item">
              <span class="name">{{ a.name }}</span>
              <span class="kind">{{ a.kind }}</span>
              <a v-if="a.url" :href="sanitizeUrl(a.url)" target="_blank" rel="noopener" class="link"><i class="fa-solid fa-link" /> Abrir</a>
            </li>
          </ul>
        </div>

        <CommentsThread :course-id="Number(courseId)" :lecture-id="Number(lectureId)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lecture-detail-view { width: 100%; padding: 24px 16px; }
.container { max-width: 1080px; margin: 0 auto; display: grid; gap: 16px; }
.header { display: grid; gap: 8px; }
.back { background: none; border: none; color: $FUDMASTER-GREEN; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
.title { color: $FUDMASTER-DARK; margin: 0; font-size: 24px; display: inline-flex; align-items: center; gap: 10px; }
.meta { color: #777; margin: 0; font-size: 14px; }
.loading, .error, .empty { display: inline-flex; align-items: center; gap: 10px; color: #555; background: $FUDMASTER-LIGHT; border: 1px solid #e6e6e6; border-radius: 10px; padding: 12px 14px; }
.error { color: $alert-error; background: $alert-error-bg; border-color: rgba($alert-error, 0.3); }
.player-card { background: $white; border: 1px solid #e6e6e6; border-radius: 16px; padding: 16px; display: grid; gap: 16px; }
.player { background: #000; border-radius: 12px; overflow: hidden; }
.player-box { position: relative; }
.video { width: 100%; max-height: 460px; display: block; }
.loading-player { display: inline-flex; align-items: center; gap: 10px; color: #fff; padding: 16px; }
.loading-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; background: rgba(0,0,0,0.25); }
.fallback { display: grid; gap: 8px; color: #fff; padding: 16px; }
.fallback .open { color: $FUDMASTER-GREEN; text-decoration: none; }
.empty-video { color: #fff; padding: 16px; }
.attachments { display: grid; gap: 8px; }
.attachments-title { color: $FUDMASTER-DARK; font-size: 18px; margin: 0; display: inline-flex; align-items: center; gap: 8px; }
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.item { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; background: $FUDMASTER-LIGHT; border: 1px solid #e6e6e6; border-radius: 10px; padding: 10px; }
.name { color: $FUDMASTER-DARK; font-weight: 600; }
.kind { color: #777; font-size: 12px; }
.link { color: $FUDMASTER-GREEN; text-decoration: none; }
</style>

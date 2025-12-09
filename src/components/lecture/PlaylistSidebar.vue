<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

type Lecture = { id: string | number; position?: number; is_published?: boolean; name?: string }
type Section = { id: string | number; name: string; lectures?: Lecture[] }

const props = defineProps<{ sections: Section[]; courseId: string | number; currentLectureId?: string | number }>()

const router = useRouter()
const open = ref<Record<string | number, boolean>>({})

const normalized = computed(() => Array.isArray(props.sections) ? props.sections : [])

function toggle(sectionId: string | number) {
  open.value[sectionId] = !open.value[sectionId]
}

function isActive(l: Lecture) {
  return String(l?.id) === String(props.currentLectureId)
}

function isBlocked(l: Lecture) {
  return !l?.is_published
}

function goTo(l: Lecture) {
  if (!props.courseId || !l?.id || isBlocked(l)) return
  router.push(`/courses/${props.courseId}/lectures/${l.id}`)
}
</script>

<template>
  <aside class="playlist">
    <div class="head">
      <h3 class="title"><i class="fa-solid fa-list" /> Contenido</h3>
    </div>
    <div class="modules">
      <div class="module" v-for="s in normalized" :key="s.id">
        <button class="module-toggle" type="button" @click="toggle(s.id)">
          <span class="module-name">{{ s.name }}</span>
          <i :class="open[s.id] ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" />
        </button>
        <ul v-show="open[s.id] !== false" class="lessons">
          <li v-for="l in (Array.isArray(s.lectures) ? s.lectures : [])" :key="l.id" class="lesson"
              :class="[{ active: isActive(l), blocked: isBlocked(l) }]" @click="goTo(l)">
            <div class="left">
              <i v-if="isBlocked(l)" class="fa-solid fa-lock" />
              <i v-else-if="isActive(l)" class="fa-solid fa-play" />
              <i v-else class="fa-regular fa-circle" />
              <span class="name">{{ l.name || `Lección ${l.position}` }}</span>
            </div>
            <div class="right">
              <i v-if="!isBlocked(l) && !isActive(l)" class="fa-solid fa-check" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.playlist { background: $white; border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
.head .title { color: $FUDMASTER-DARK; font-size: 16px; margin: 0; display: inline-flex; align-items: center; gap: 8px; }
.modules { display: grid; gap: 8px; }
.module-toggle { background: none; border: none; color: $FUDMASTER-DARK; display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px; cursor: pointer; border-radius: 8px; }
.lessons { list-style: none; padding: 0; margin: 0; display: grid; }
.lesson { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.lesson:hover { background: $overlay-purple; }
.lesson.active { background: $overlay-purple; }
.lesson.blocked { opacity: 0.6; cursor: not-allowed; }
.lesson .left { display: inline-flex; align-items: center; gap: 10px; color: $FUDMASTER-DARK; }
.lesson .right { color: $FUDMASTER-GREEN; }
.name { font-size: 14px; }
</style>

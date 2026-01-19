<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

type Lecture = { id: string | number; position?: number; is_published?: boolean; name?: string }
type Section = { id: string | number; name: string; lectures?: Lecture[] }

const props = defineProps<{ sections: Section[]; courseId: string | number; currentLectureId?: string | number; completedLectureIds?: Array<string | number> }>()

const router = useRouter()
// Initialize all sections as open by default or just first? Let's default to all open for better visibility
const open = ref<Record<string | number, boolean>>({})

// Helper to init open state if needed, or just let them be closed initially? 
// User complained about "too much space", maybe starting closed is better? 
// Or better: ensure they are togglable with animation.
// Let's default to open for the first section maybe? Or all? 
// Given the user comment "se ve con mucho espacio", compacting it is key.
// Let's initialize with the section containing the current lecture open.

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

function isCompleted(l: Lecture) {
  const list = Array.isArray(props.completedLectureIds) ? props.completedLectureIds : []
  return list.some((id) => String(id) === String(l?.id))
}

function goTo(l: Lecture) {
  if (!props.courseId || !l?.id || isBlocked(l)) return
  router.push(`/courses/${props.courseId}/lectures/${l.id}`)
}

// Auto-open sections containing active lecture
if (props.currentLectureId) {
  for (const s of normalized.value) {
    if (s.lectures?.some(l => String(l.id) === String(props.currentLectureId))) {
      open.value[s.id] = true
    }
  }
} else if (normalized.value.length > 0) {
  // Open first by default if nothing active
  const firstId = normalized.value[0]?.id
  if (firstId) open.value[firstId] = true
}

</script>

<template>
  <aside class="playlist">
    <div class="head">
      <h3 class="title"><i class="fa-solid fa-list-ul" /> Contenido del curso</h3>
    </div>
    <div class="modules">
      <div class="module" v-for="s in normalized" :key="s.id">
        <button class="module-toggle" type="button" @click="toggle(s.id)" :class="{ 'is-open': open[s.id] }">
          <span class="module-name">{{ s.name }}</span>
          <i class="fa-solid fa-chevron-down arrow" />
        </button>
        
        <Transition name="slide">
            <ul v-show="open[s.id]" class="lessons">
            <li v-for="l in (Array.isArray(s.lectures) ? s.lectures : [])" :key="l.id" class="lesson"
                :class="[{ active: isActive(l), blocked: isBlocked(l), completed: isCompleted(l) }]" @click="goTo(l)">
                <div class="status-icon">
                    <i v-if="isBlocked(l)" class="fa-solid fa-lock" />
                    <i v-else-if="isActive(l)" class="fa-solid fa-circle-play" />
                    <i v-else-if="isCompleted(l)" class="fa-solid fa-circle-check" />
                    <i v-else class="fa-regular fa-circle" />
                </div>
                <div class="lesson-info">
                    <span class="name">{{ l.name || `Lección ${l.position}` }}</span>
                    <span class="type-badge" v-if="l.is_published"><i class="fa-solid fa-video" /></span>
                </div>
            </li>
            </ul>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.playlist {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.head {
  padding: 16px;
  background: color-mix(in oklab, var(--bg), var(--text) 2%);
  border-bottom: 1px solid var(--border);

  .title {
    color: var(--text);
    font-size: 15px;
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;

    i {
      color: var(--accent);
    }
  }
}

.modules {
  display: flex;
  flex-direction: column;
}

.module {
  border-bottom: 1px solid color-mix(in oklab, var(--border), transparent 50%);

  &:last-child {
    border-bottom: none;
  }
}

.module-toggle {
  background: none;
  border: none;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  transition: background 0.2s;

  &:hover {
    background: color-mix(in oklab, var(--bg), var(--text) 2%);
  }

  .arrow {
    font-size: 12px;
    color: color-mix(in oklab, var(--text), transparent 60%);
    transition: transform 0.3s ease;
  }

  &.is-open .arrow {
    transform: rotate(180deg);
  }
}

.lessons {
  list-style: none;
  padding: 0;
  margin: 0;
  background: color-mix(in oklab, var(--bg), var(--text) 1%);
}

.lesson {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 16px 10px 12px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s;

  &:hover:not(.blocked) {
    background: color-mix(in oklab, var(--accent), transparent 95%);
  }

  &.active {
    background: color-mix(in oklab, var(--accent), transparent 92%);
    border-left-color: var(--accent);

    .name {
      font-weight: 600;
      color: var(--accent);
    }

    .status-icon {
      color: var(--accent);
    }
  }

  &.completed {
    .status-icon {
      color: #10b981;
    }

    // Green check
  }

  &.blocked {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.status-icon {
  font-size: 14px;
  margin-top: 2px; // optical alignment
  width: 16px;
  display: flex;
  justify-content: center;
  color: color-mix(in oklab, var(--text), transparent 70%);
}

.lesson-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.name {
  font-size: 13.5px;
  line-height: 1.4;
  color: color-mix(in oklab, var(--text), transparent 10%);
}

.type-badge {
  color: color-mix(in oklab, var(--text), transparent 70%);
  font-size: 11px;
}

// Transitions
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 500px; // Arbitrary max height for transition
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>

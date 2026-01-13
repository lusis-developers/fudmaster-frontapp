<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCoursesStore } from '@/stores/courses'
import { useCareersStore } from '@/stores/careers'
import UpgradeBanner from '@/components/UpgradeBanner.vue'

const userStore = useUserStore()
const coursesStore = useCoursesStore()
const careersStore = useCareersStore()
const router = useRouter()

const isDark = ref(false)
const props = defineProps({
  menuIsOpen: { type: Boolean, default: false }
})

const enrolledCount = computed(() => {
  return Array.isArray(coursesStore.enrolledCourses) ? coursesStore.enrolledCourses.length : 0
})

const careersCount = computed(() => {
  return Array.isArray(careersStore.careers) ? careersStore.careers.length : 0
})

const menu = [
  { name: 'Mis Cursos', link: '/courses', icon: 'fa-solid fa-book-open' },
  { name: 'Explorar', link: '/courses/all', icon: 'fa-solid fa-compass' },
  { name: 'Escuelas', link: '/careers', icon: 'fa-solid fa-graduation-cap' },
  { name: 'Certificados', link: '/certificates', icon: 'fa-solid fa-award' },
  { name: 'Mi Perfil', link: '/profile/edit', icon: 'fa-solid fa-user-gear' },
]

function isSelected(link: string) {
  const path = router.currentRoute.value.path
  if (link === '/courses' && path.startsWith('/courses/all')) return false
  return path === link || (link !== '/' && path.startsWith(link))
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() { isDark.value = !isDark.value; localStorage.setItem('theme', isDark.value ? 'dark' : 'light'); applyTheme() }
onMounted(async () => {
  const t = localStorage.getItem('theme'); isDark.value = t === 'dark'; applyTheme()
  try { await careersStore.fetchAll() } catch { }
  try { userStore.hydrate(); const uid = userStore.id || localStorage.getItem('user_id'); if (uid) await coursesStore.fetchEnrolled(String(uid)) } catch { }
})
</script>

<template>
  <div class="user-sidebar" :class="{ 'active': menuIsOpen }">
    <div class="user-sidebar-wrapper">
      <ul class="user-menu">
        <li
          v-for="item in menu"
          :key="item.name"
          :class="{ 'active': !menuIsOpen, 'selected': isSelected(item.link) }">
          <i :class="item.icon" class="icon" />
          <RouterLink :to="item.link" :class="{ 'active': menuIsOpen, 'selected': isSelected(item.link) }">{{ item.name }}</RouterLink>
          <span v-if="item.link === '/careers' && careersCount > 0" class="menu-badge">{{ careersCount }}</span>
          <span v-if="item.link === '/courses' && enrolledCount > 0" class="menu-badge">{{ enrolledCount }}</span>
        </li>
      </ul>
    </div>

    <div class="user-sidebar-footer">
      <!-- CTA para usuarios Free en el Sidebar -->
      <UpgradeBanner variant="sidebar" :compact="menuIsOpen" />
      
      <button class="setting-button" type="button" @click="toggleTheme">
        <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user {
  &-sidebar {
    background-color: var(--bg);
    height: 100%;
    border-right: 1px solid var(--border);
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &.active {
      width: 64px;

      .user-sidebar-footer {
        padding: 8px;
        align-items: center;
      }
    }

    &-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    &-footer {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid transparent; // Optional separation
    }

    .setting-button {
      background: none;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      color: var(--text);
      font-size: 18px;
      transition: all 0.2s;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        background-color: color-mix(in oklab, var(--text), transparent 94%);
      }
    }
  }

  &-menu {
    list-style: none;
    padding: 0;
    margin-top: 42px;

    .icon {
      margin-right: 8px;
    }

    li {
      padding: 0 12px;
      margin: 36px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-left: 3px solid transparent;

      &.active {
        display: flex;
        justify-content: flex-start;
      }

      &.selected {
        border-left-color: var(--accent);
      }

      a,
      .router-link-active,
      .router-link-exact-active {
        text-decoration: none;
        color: var(--text);
        font-weight: 500;

        &:hover {
          color: var(--accent);
        }

        &.active {
          display: none;
        }

        &.selected {
          color: var(--accent);
          font-weight: 700;
        }
      }

      .menu-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--accent);
        color: $white;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 11px;
        margin-left: auto;
      }
    }
  }
}
</style>

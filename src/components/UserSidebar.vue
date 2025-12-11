<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCareersStore } from '@/stores/careers'
import { useCoursesStore } from '@/stores/courses'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  menuIsOpen: {
    type: Boolean,
    required: true,
  },
});

const menu = [
  { name: 'Mis cursos', link: '/courses', icon: 'fa-solid fa-book' },
  { name: 'Escuelas', link: '/careers', icon: 'fa-solid fa-graduation-cap' },
  { name: 'Todos los cursos', link: '/courses/all', icon: 'fa-solid fa-list' },
];

const route = useRoute()
function isSelected(link: string) {
  return route.path === link || route.path.startsWith(link + '/')
}

const careersStore = useCareersStore()
const coursesStore = useCoursesStore()
const userStore = useUserStore()

const careersCount = computed(() => (Array.isArray(careersStore.careers) ? careersStore.careers.length : 0))
const enrolledCount = computed(() => (Array.isArray(coursesStore.enrolledCourses) ? coursesStore.enrolledCourses.length : 0))

const isDark = ref(false)
function applyTheme() { document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light') }
function toggleTheme() { isDark.value = !isDark.value; localStorage.setItem('theme', isDark.value ? 'dark' : 'light'); applyTheme() }
onMounted(async () => {
  const t = localStorage.getItem('theme'); isDark.value = t === 'dark'; applyTheme()
  try { await careersStore.fetchAll() } catch {}
  try { userStore.hydrate(); const uid = userStore.id || localStorage.getItem('user_id'); if (uid) await coursesStore.fetchEnrolled(String(uid)) } catch {}
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
    <button class="setting-button" type="button" @click="toggleTheme">
      <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" />
    </button>
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

    .setting-button {
      background: none;
      border: none;
      padding: 12px;
      cursor: pointer;
      font-size: 18px;
      color: var(--text);
      margin-bottom: 12px;

      &:hover {
        color: var(--accent);
      }
    }

    &.active {
      width: 64px;
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

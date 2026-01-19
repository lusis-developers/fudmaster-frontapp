<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import dashboardService from '@/services/dashboard.service';
import type { DashboardStats, RecentCourse } from '@/types/dashboard';
import DashboardStatsDisplay from '@/components/User/Dashboard/DashboardStats.vue';
import RecentCourses from '@/components/User/Dashboard/RecentCourses.vue';

const userStore = useUserStore();
const isLoading = ref(true);
const error = ref<string | null>(null);

const stats = ref<DashboardStats>({
  inProgressCourses: 0,
  completedCourses: 0,
  totalCertificates: 0,
  streak: 0
});

const recentCourses = ref<RecentCourse[]>([]);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
});

const fetchDashboardData = async () => {
  if (!userStore.id) return;

  try {
    isLoading.value = true;
    const { data } = await dashboardService.getDashboard(userStore.id);

    stats.value = data.stats;
    recentCourses.value = data.recentCourses;
  } catch (err: any) {
    console.error('Failed to load dashboard:', err);
    error.value = 'No pudimos cargar tu información. Por favor intenta más tarde.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (userStore.id) {
    await fetchDashboardData();
  }
});
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1 class="welcome-title">
        {{ greeting }}, <span class="user-name">{{ userStore.name || 'Estudiante' }}</span>
      </h1>
      <p class="welcome-subtitle">Aquí está tu resumen de hoy.</p>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <p>{{ error }}</p>
      <button @click="fetchDashboardData" class="btn-retry">Reintentar</button>
    </div>

    <template v-else>
      <DashboardStatsDisplay :stats="stats" />
      <RecentCourses :courses="recentCourses" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

.dashboard-header {
  margin-bottom: 3rem;
}

.welcome-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;

  .user-name {
    color: var(--accent);
  }
}

.welcome-subtitle {
  font-size: 1.125rem;
  color: color-mix(in srgb, var(--text) 70%, transparent);
  margin: 0;
  font-weight: 500;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: color-mix(in srgb, var(--text) 60%, transparent);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ef4444;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.btn-retry {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background-color: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>

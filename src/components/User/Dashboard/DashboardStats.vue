<script setup lang="ts">
import type { DashboardStats } from '@/types/dashboard';

defineProps<{
  stats: DashboardStats;
}>();
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">
        <i class="fa-solid fa-spinner"></i>
      </div>
      <div>
        <div class="stat-value">{{ stats.inProgressCourses }}</div>
        <div class="stat-label">En Progreso</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon success">
        <i class="fa-solid fa-check-circle"></i>
      </div>
      <div>
        <div class="stat-value">{{ stats.completedCourses }}</div>
        <div class="stat-label">Completados</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon warning">
        <i class="fa-solid fa-award"></i>
      </div>
      <div>
        <div class="stat-value">{{ stats.totalCertificates }}</div>
        <div class="stat-label">Certificados</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon danger">
        <i class="fa-solid fa-fire"></i>
      </div>
      <div>
        <div class="stat-value">{{ stats.streak }}</div>
        <div class="stat-label">Racha (Días)</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--text) 5%, transparent);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;

  &.success {
    color: var(--accent);
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  &.warning {
    color: #f59e0b;
    background-color: color-mix(in srgb, #f59e0b 10%, transparent);
  }

  &.danger {
    color: #ef4444;
    background-color: color-mix(in srgb, #ef4444 10%, transparent);
  }
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--text) 70%, transparent);
  font-weight: 500;
  margin-top: 2px;
}
</style>

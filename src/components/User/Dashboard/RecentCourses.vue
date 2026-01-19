<script setup lang="ts">
import type { RecentCourse } from '@/types/dashboard';
import RecentCourseCard from './RecentCourseCard.vue';

defineProps<{
  courses: RecentCourse[];
}>();
</script>

<template>
  <div class="recent-courses-section">
    <div class="section-header">
      <h2 class="section-title">Continúa Aprendiendo</h2>
      <router-link to="/courses" class="link-view-all">Ver todos</router-link>
    </div>
    
    <div v-if="courses.length > 0" class="courses-grid">
      <RecentCourseCard 
        v-for="course in courses" 
        :key="course.courseId" 
        :course="course" 
      />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <p>No has empezado ningún curso recientemente.</p>
      <router-link to="/courses/all" class="btn-explore">Explorar Cursos</router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recent-courses-section {
  margin-top: 3rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.link-view-all {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;

  &:hover {
    text-decoration: underline;
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 16px;
  color: color-mix(in srgb, var(--text) 70%, transparent);

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    font-weight: 500;
  }
}

.btn-explore {
  display: inline-flex;
  padding: 0.75rem 2rem;
  background-color: var(--text);
  color: var(--bg);
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>

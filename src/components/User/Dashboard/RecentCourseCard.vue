<script setup lang="ts">
import type { RecentCourse } from '@/types/dashboard';
import { computed } from 'vue';

const props = defineProps<{
  course: RecentCourse;
}>();

const progressStyle = computed(() => ({
  width: `${props.course.progress}%`
}));

const continueUrl = computed(() => {
  if (props.course.nextLecture) {
    return props.course.nextLecture.url;
  }
  return `/courses/${props.course.courseId}`;
});
</script>

<template>
  <div class="course-card">
    <div class="course-thumb">
      <img :src="course.thumbnail || '/placeholder-course.jpg'" :alt="course.title" loading="lazy">
      <div class="play-overlay">
        <i class="fa-solid fa-play"></i>
      </div>
    </div>
    <div class="course-content">
      <div class="course-header">
        <h3 class="course-title">{{ course.title }}</h3>
      </div>
      
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-text">{{ Math.round(course.progress) }}% Completado</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="progressStyle"></div>
        </div>
      </div>

      <div class="course-actions">
        <a :href="continueUrl" class="btn-continue">
          <i class="fa-solid" :class="course.progress > 0 ? 'fa-play' : 'fa-graduation-cap'"></i>
          {{ course.progress > 0 ? 'Continuar Viendo' : 'Empezar Curso' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.course-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);

    .course-thumb img {
      transform: scale(1.05);
    }

    .play-overlay {
      opacity: 1;
    }
  }
}

.course-thumb {
  height: 180px;
  position: relative;
  background: color-mix(in srgb, var(--text) 5%, transparent);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
    font-size: 2rem;
  }
}

.course-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--text) 70%, transparent);
}

.progress-bar {
  height: 6px;
  background: color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--accent);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.course-actions {
  margin-top: auto;
}

.btn-continue {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background-color: var(--accent);
  color: white;
  text-align: center;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.1);
  }

  i {
    font-size: 0.9rem;
  }
}
</style>

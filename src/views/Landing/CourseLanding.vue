<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

function sanitizeUrl(url?: string) {
  return (url || '').toString().replace(/`/g, '').trim()
}

const coverImage = computed(() => {
  return sanitizeUrl(props.course?.image_url) || sanitizeUrl(props.course?.coverUrl) || '/src/assets/fudmaster-color.png'
})

const authorName = computed(() => props.course?.author_bio?.name || 'Instructor Fudmaster')
const authorBio = computed(() => props.course?.author_bio?.bio || 'Experto en gastronomía y gestión de restaurantes.')
const authorImage = computed(() => props.course?.author_bio?.profile_image_url || null)

const sections = computed(() => {
  return Array.isArray(props.course?.lecture_sections) ? props.course.lecture_sections : []
})

const totalLectures = computed(() => {
  let count = 0
  sections.value.forEach((s: any) => {
    if (Array.isArray(s.lectures)) count += s.lectures.length
  })
  return count
})

function goToCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <div class="landing-page">
    <div class="hero-bg">
      <div class="container hero-content">
        <div class="left-col">
          <div class="badges">
            <span class="badge premium"><i class="fa-solid fa-crown" /> Premium</span>
            <span class="badge"><i class="fa-solid fa-video" /> {{ totalLectures }} Clases</span>
            <span class="badge"><i class="fa-solid fa-clock" /> A tu ritmo</span>
          </div>
          
          <h1 class="course-title">{{ course.name || course.title }}</h1>
          <p class="course-desc">{{ course.heading || course.shortDescription || course.description }}</p>
          
          <div class="instructor-mini" v-if="authorName">
            <img v-if="authorImage" :src="authorImage" alt="Instructor" class="instructor-thumb" />
            <div class="instructor-thumb placeholder" v-else><i class="fa-solid fa-user" /></div>
            <span>Por <strong>{{ authorName }}</strong></span>
          </div>

          <div class="mobile-cta">
             <button class="cta-btn block" @click="goToCheckout">
              Empieza ahora
              <i class="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
        
        <div class="right-col">
          <div class="sticky-card">
            <div class="video-preview">
              <img :src="coverImage" alt="Course Cover" />
              <div class="play-overlay">
                <i class="fa-solid fa-play" />
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">Accede a este curso</h3>
              <p class="card-subtitle">Obtén acceso ilimitado a este y todos los cursos.</p>
              <button class="cta-btn" @click="goToCheckout">
                Suscríbete ahora
                <i class="fa-solid fa-bolt" />
              </button>
              <p class="guarantee"><i class="fa-solid fa-shield-halved" /> Garantía de 7 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container main-body">
      <div class="body-left">
        
        <div class="section-block" v-if="course.benefits || course.what_you_will_learn">
          <h2><i class="fa-solid fa-bullseye" /> Lo que aprenderás</h2>
           <div class="learning-list">
             <!-- If benefits is an array -->
             <ul v-if="Array.isArray(course.benefits)">
               <li v-for="(item, i) in course.benefits" :key="i"><i class="fa-solid fa-check" /> {{ item }}</li>
             </ul>
             <!-- Fallback if it's just text description -->
             <p v-else>{{ course.what_you_will_learn || 'Domina las habilidades necesarias para llevar tu negocio al siguiente nivel.' }}</p>
           </div>
        </div>

        <div class="section-block">
          <h2><i class="fa-solid fa-list-ul" /> Temario del curso</h2>
          <div class="syllabus">
            <div class="syllabus-section" v-for="(section, idx) in sections" :key="section.id || idx">
              <div class="section-header">
                <span class="section-number">{{ idx + 1 }}</span>
                <h3>{{ section.name }}</h3>
              </div>
              <div class="lecture-list">
                <div class="lecture-item" v-for="(lecture, lIdx) in section.lectures" :key="lecture.id || lIdx">
                  <div class="lecture-icon">
                    <i class="fa-solid fa-lock" />
                  </div>
                  <div class="lecture-info">
                    <span class="lecture-title">{{ lecture.name }}</span>
                    <!-- <span class="lecture-time">10:00</span> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-block instructor-block">
          <h2><i class="fa-solid fa-chalkboard-user" /> Tu Instructor</h2>
          <div class="instructor-card">
            <div class="instructor-img">
               <img v-if="authorImage" :src="authorImage" alt="Instructor" />
               <div v-else class="placeholder"><i class="fa-solid fa-user-tie" /></div>
            </div>
            <div class="instructor-bio">
              <h3>{{ authorName }}</h3>
              <p>{{ authorBio }}</p>
            </div>
          </div>
        </div>

      </div>
      <div class="body-right">
        <!-- Spacer for the sticky card on desktop -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Variables would ideally be imported, but we use the global ones injected or mimic them
$dark-bg: #0a0a0a; // Platzi dark
$card-bg: #1c1c1c;
$accent: #2BBB92; // Fudmaster/Platzi Greenish
$text-main: #ffffff;
$text-muted: #a0a0a0;

.landing-page {
  background: $dark-bg;
  color: $text-main;
  min-height: 100vh;
  font-family: 'Inter', sans-serif; // Assuming font exists or fallback
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero
.hero-bg {
  padding: 60px 0 40px;
  background: radial-gradient(circle at 70% 20%, rgba(43, 187, 146, 0.15) 0%, rgba(1, 13, 39, 0) 50%);
  position: relative;
}

.hero-content {
  display: grid;
  gap: 40px;

  @media(min-width: 900px) {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: center;
  }
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 99px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: $text-muted;

    &.premium {
      background: rgba(218, 65, 103, 0.2); // Pinkish
      color: #DA4167;
      font-weight: 600;
    }
  }
}

.course-title {
  font-size: 36px;
  line-height: 1.1;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(to right, #fff, #cacaca);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media(min-width: 900px) {
    font-size: 48px;
  }
}

.course-desc {
  font-size: 16px;
  line-height: 1.6;
  color: $text-muted;
  margin: 0;
  max-width: 500px;
}

.instructor-mini {
  display: flex;
  align-items: center; // Fixed typo 'centert'
  gap: 12px;
  margin-top: 10px;

  .instructor-thumb {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: #333;

    &.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #777;
    }
  }

  span {
    color: $text-muted;
    font-size: 14px;

    strong {
      color: white;
      font-weight: 600;
    }
  }
}

.mobile-cta {
  margin-top: 20px;

  @media(min-width: 900px) {
    display: none;
  }
}

// Right Col / Sticky Card
.right-col {
  position: relative;
  z-index: 10;
}

.sticky-card {
  background: $card-bg;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);

  @media(min-width: 900px) {
    // position: sticky; // Commented out to avoid layout issues for now, can be enabled
    // top: 100px;
  }
}

.video-preview {
  position: relative;
  aspect-ratio: 16/9;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;

    i {
      font-size: 40px;
      color: white;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
    }
  }

  &:hover .play-overlay {
    background: rgba(0, 0, 0, 0.1);
  }
}

.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.card-title {
  margin: 0;
  font-size: 20px;
  color: white;
}

.card-subtitle {
  margin: 0;
  font-size: 14px;
  color: $text-muted;
}

.cta-btn {
  background: $accent;
  color: #003322;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s, filter 0.2s;
  width: 100%;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  &.block {
    width: 100%;
  }
}

.guarantee {
  font-size: 12px;
  color: $text-muted;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

// Main Body
.main-body {
  padding: 40px 20px;
  display: grid;
  gap: 40px;

  @media(min-width: 900px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
}

.section-block {
  margin-bottom: 40px;

  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;

    i {
      color: $accent;
      font-size: 20px;
    }
  }
}

.learning-list {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 12px;

    li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: #d0d0d0;
      line-height: 1.5;

      i {
        color: $accent;
        margin-top: 4px;
      }
    }
  }

  p {
    color: #d0d0d0;
    line-height: 1.6;
  }
}

// Syllabus
.syllabus {
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  padding-left: 24px;
  margin-left: 10px;
}

.syllabus-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .section-number {
    background: rgba(255, 255, 255, 0.1);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 12px;
    color: $text-muted;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    color: white;
  }
}

.lecture-list {
  display: grid;
  gap: 12px;
}

.lecture-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);

  .lecture-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border-radius: 50%;
    color: #555;
    font-size: 12px;
  }

  .lecture-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .lecture-title {
      color: #ccc;
      font-size: 14px;
    }

    .lecture-time {
      font-size: 12px;
      color: #666;
    }
  }
}

// Instructor
.instructor-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: $card-bg;
  padding: 24px;
  border-radius: 16px;

  .instructor-img {
    width: 80px;
    height: 80px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #666;
    }
  }

  .instructor-bio {
    h3 {
      margin: 0 0 8px;
      color: white;
    }

    p {
      margin: 0;
      color: $text-muted;
      line-height: 1.5;
      font-size: 14px;
    }
  }
}
</style>

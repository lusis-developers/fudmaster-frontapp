import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// Layout
import UserLayout from "../layout/UserLayout.vue";
import PublicLayout from "../layout/PublicLayout.vue";

// Views
import MyCourses from "../views/User/MyCourses.vue";
import AllCourses from "../views/User/AllCourses.vue";
import CourseDetail from "../views/User/CourseDetail.vue";
import LectureDetail from "../views/User/LectureDetail.vue";
import QuizView from "../views/User/QuizView.vue";
import QuizResult from "../views/User/QuizResult.vue";
import CertificatesView from "../views/User/CertificatesView.vue";

// Landingpage
import NicoleLanding from "../views/Landing/NicoleLanding.vue";
import LoginView from "../views/Auth/Login.vue";
import Checkout from "../views/Checkout.vue";
import PayResponse from "../views/PayResponse.vue";
import Careers from "../views/Careers.vue";
import CareerDetail from "../views/CareerDetail.vue";
import ProfileEdit from "../views/User/ProfileEdit.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: UserLayout,
    meta: {
      title: 'Fudmaster | lleva tu cocina al siguiente nivel',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/courses'
      },
      {
        path: 'courses',
        component: MyCourses,
        meta: { title: 'Mis cursos', requiresAuth: true }
      },
      {
        path: 'courses/all',
        component: AllCourses,
        meta: { title: 'Todos los cursos', requiresAuth: true }
      }
      ,
      {
        path: 'courses/:id',
        component: CourseDetail,
        meta: { title: 'Detalle de curso', requiresAuth: true }
      }
      ,
      {
        path: 'courses/:id/lectures/:lectureId',
        component: LectureDetail,
        meta: { title: 'Clase', requiresAuth: true }
      }
      ,
      {
        path: 'courses/:id/quiz',
        component: QuizView,
        meta: { title: 'Quiz', requiresAuth: true }
      }
      ,
      {
        path: 'courses/:id/quiz/result',
        component: QuizResult,
        meta: { title: 'Resultado del quiz', requiresAuth: true }
      }
      ,
      {
        path: 'courses/:id/quizzes/:quizId',
        component: QuizView,
        meta: { title: 'Quiz', requiresAuth: true }
      }
      ,
      {
        path: 'courses/:id/quizzes/:quizId/result',
        component: QuizResult,
        meta: { title: 'Resultado del quiz', requiresAuth: true }
      }
      ,
      {
        path: 'careers',
        component: Careers,
        meta: { title: 'Escuelas o Carreras', requiresAuth: true }
      }
      ,
      {
        path: 'careers/:id',
        component: CareerDetail,
        meta: { title: 'Detalle de carrera', requiresAuth: true }
      }
      ,
      {
        path: 'profile/edit',
        component: ProfileEdit,
        meta: { title: 'Editar perfil', requiresAuth: true }
      },
      {
        path: 'certificates',
        component: CertificatesView,
        meta: { title: 'Mis Certificados', requiresAuth: true }
      }
    ]
  },
  {
    path: '/landing-page',
    component: NicoleLanding,
    meta: {
      title: 'Cambia tu vida gastronómica con Nicole y su equipo'
    }
  },
  {
    path: '/login',
    component: PublicLayout,
    meta: { title: 'Iniciar sesión' },
    children: [
      { path: '', component: LoginView }
    ]
  },
  {
    path: '/request-password-recovery',
    component: PublicLayout,
    meta: { title: 'Recuperar Contraseña' },
    children: [
      { path: '', component: () => import('../views/Auth/RequestPasswordRecovery.vue') }
    ]
  },
  {
    path: '/reset-password',
    component: PublicLayout,
    meta: { title: 'Restablecer Contraseña' },
    children: [
      { path: '', component: () => import('../views/Auth/ResetPassword.vue') }
    ]
  },
  {
    path: '/checkout',
    component: PublicLayout,
    meta: { title: 'Checkout' },
    children: [
      { path: '', component: Checkout }
    ]
  }
  ,
  {
    path: '/pay-response',
    component: PublicLayout,
    meta: { title: 'Respuesta de pago' },
    children: [
      { path: '', component: PayResponse }
    ]
  },
  {
    path: '/verify-certificate',
    component: PublicLayout,
    meta: { title: 'Verificar Certificado' },
    children: [
      { path: '', component: () => import('../views/Public/VerifyCertificate.vue') },
      { path: ':id', component: () => import('../views/Public/VerifyCertificate.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to) => {
  const hasToken = !!localStorage.getItem('access_token')
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (requiresAuth && !hasToken) {
    return { path: '/landing-page', replace: true }
  }

  if (to.path === '/login' && hasToken) {
    return { path: '/', replace: true }
  }
})

router.afterEach((to) => {
  const base = 'Fudmaster | lleva tu cocina al siguiente nivel'
  const recordWithTitle = to.matched.slice().reverse().find((r) => (r.meta as any)?.title)
  const title = ((to.meta as any)?.title) || ((recordWithTitle?.meta as any)?.title) || base
  document.title = String(title)
})

export default router

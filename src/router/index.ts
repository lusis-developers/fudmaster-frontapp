import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// Layout
import UserLayout from "../layout/UserLayout.vue";
import PublicLayout from "../layout/PublicLayout.vue";

// Views
import UserHome from "../views/User/UserHome.vue";

// Landingpage
import NicoleLanding from "../views/Landing/NicoleLanding.vue";
import LoginView from "../views/Auth/Login.vue";

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
        component: UserHome,
        meta: {
          title: 'Aquí empieza tu éxito gastronómico'
        } 
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const hasToken = !!localStorage.getItem('access_token')
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (requiresAuth && !hasToken) {
    return { path: '/login', replace: true }
  }

  if (to.path === '/login' && hasToken) {
    return { path: '/', replace: true }
  }
})

export default router

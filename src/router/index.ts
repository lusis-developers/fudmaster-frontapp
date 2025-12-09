import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// Layout
import UserLayout from "../layout/UserLayout.vue";

// Views
import UserHome from "../views/User/UserHome.vue";

// Landingpage
import NicoleLanding from "../views/Landing/NicoleLanding.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: UserLayout,
    meta: {
      title: 'Fudmaster | lleva tu cocina al siguiente nivel'
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
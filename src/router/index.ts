import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

// Layout
import UserLayout from "../layout/UserLayout.vue";

// Views
import UserHome from "../views/User/UserHome.vue";

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
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
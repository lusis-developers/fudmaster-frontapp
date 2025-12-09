import { createSSRApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

import router from './router'


async function createVueApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  app.use(router)

  return app
}

export { createVueApp }
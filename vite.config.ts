import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/index.scss" as *;`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    allowedHosts: ['fudmaster-testing-frontend.fudmaster.com.ec']
  },
  build: {
    target: 'esnext'
  }
})

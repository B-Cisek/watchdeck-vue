import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vueRouter from 'vue-router/vite'
import vueLayouts from 'vite-plugin-vue-layouts'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must come before vue()
    vueRouter({
      dts: 'src/route-map.d.ts',
    }),
    vueLayouts(),
    vue(),
    vueDevTools(),
    ui({
      ui: {
        colors: {
          primary: 'green',
          neutral: 'zinc',
        },
      },
    }),
  ],
  server: {
    // Same origin for the app and the API, so session cookies work without CORS.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

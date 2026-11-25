import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'
import { useAuthStore } from '@/stores/auth'
import { resolveNavigation } from './guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes as RouteRecordRaw[]),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  // After a failed check a public page is shown right away; it offers the retry itself.
  if (!(to.meta.public && auth.initError)) {
    await auth.init()
  }
  return resolveNavigation(to, auth.isAuthenticated)
})

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router

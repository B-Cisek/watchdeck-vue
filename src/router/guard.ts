import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

type Target = Pick<RouteLocationNormalized, 'path' | 'fullPath' | 'meta' | 'query'>

const LOGIN_PATH = '/login'

/** Returns the path only if it stays inside the app and does not lead back to login. */
export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !/^\/(?![/\\])/.test(value)) {
    return '/'
  }
  return /^\/login\/?(?:[?#]|$)/.test(value) ? '/' : value
}

function loginLocation(target: Target): { path: string; query?: { redirect: string } } {
  return target.path === '/'
    ? { path: LOGIN_PATH }
    : { path: LOGIN_PATH, query: { redirect: target.fullPath } }
}

export function resolveNavigation(to: Target, isAuthenticated: boolean): true | RouteLocationRaw {
  if (isAuthenticated) {
    return to.path === LOGIN_PATH ? safeRedirect(to.query.redirect) : true
  }
  return to.meta.public ? true : loginLocation(to)
}

/** Parallel requests can all fail with 401; only the first one ends the session. */
export function createUnauthorizedHandler(
  auth: { readonly isAuthenticated: boolean; clear(): void },
  push: (to: RouteLocationRaw) => unknown,
  currentRoute: () => Target,
): () => void {
  return () => {
    if (!auth.isAuthenticated) {
      return
    }
    auth.clear()
    push(loginLocation(currentRoute()))
  }
}

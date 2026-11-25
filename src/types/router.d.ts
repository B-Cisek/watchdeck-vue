import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Can be opened without signing in. */
    public?: boolean
  }
}

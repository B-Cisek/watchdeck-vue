import { auth } from '@/api/auth'
import type { LoginCredentials, User } from '@/types/auth'
import { isAxiosError } from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  // The session could not be checked (server down, 5xx), so we don't know who the user is.
  const initError = ref(false)
  let initPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => user.value !== null)

  function hasRole(role: string): boolean {
    return user.value?.roles.includes(role) ?? false
  }

  function init(): Promise<void> {
    initPromise ??= checkSession()
    return initPromise
  }

  async function checkSession(): Promise<void> {
    try {
      setUser(await auth.me())
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setUser(null)
      } else {
        initError.value = true
        // Let the next init() try again.
        initPromise = null
      }
    }
  }

  function setUser(value: User | null): void {
    user.value = value
    initialized.value = true
    initError.value = false
    initPromise ??= Promise.resolve()
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    setUser(await auth.login(credentials))
  }

  async function logout(): Promise<void> {
    await auth.logout()
    clear()
  }

  function clear(): void {
    user.value = null
  }

  return { user, initialized, initError, isAuthenticated, hasRole, init, login, logout, clear }
})

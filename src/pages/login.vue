<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { safeRedirect } from '@/router/guard'
import { useAuthStore } from '@/stores/auth'

const SERVER_ERROR = 'Could not reach the server. Please try again.'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loginError = ref<string | null>(null)
const error = computed(() => loginError.value ?? (auth.initError ? SERVER_ERROR : null))

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    autocomplete: 'email',
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    autocomplete: 'current-password',
    required: true,
  },
  {
    name: 'remember',
    type: 'checkbox',
    label: 'Remember me',
  },
]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type Schema = z.output<typeof schema>

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  loginError.value = null
  loading.value = true
  try {
    await auth.login(data)
    await openApp()
  } catch (e) {
    loginError.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function retry() {
  loading.value = true
  try {
    await auth.init()
    if (auth.isAuthenticated) {
      await openApp()
    }
  } finally {
    loading.value = false
  }
}

function openApp() {
  return router.replace(safeRedirect(route.query.redirect))
}

function errorMessage(e: unknown): string {
  // The API explains a 401 itself: wrong credentials or too many attempts.
  if (isAxiosError<{ error?: string }>(e) && e.response?.status === 401) {
    return e.response.data?.error ?? 'Invalid credentials.'
  }
  return SERVER_ERROR
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <!-- NOTE: Validates on submit only. With blur validation an error can disappear mid-click, shifting the layout so the click misses. -->
    <UAuthForm
      :as="{ title: 'h1' }"
      :schema="schema"
      :fields="fields"
      :validate-on="[]"
      :submit="{ label: 'Sign in' }"
      :loading="loading"
      title="Welcome back"
      description="Enter your credentials to access Watchdeck."
      @submit="onSubmit"
    >
      <template #leading>
        <img src="/logo.svg" alt="Watchdeck" class="mx-auto size-10" />
      </template>

      <template v-if="error" #validation>
        <UAlert
          role="alert"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="error"
          :actions="
            auth.initError && !loginError
              ? [{ label: 'Retry', color: 'error', variant: 'outline', loading, onClick: retry }]
              : []
          "
        />
      </template>
    </UAuthForm>
  </UPageCard>
</template>

<route lang="yaml">
meta:
  layout: auth
  public: true
</route>

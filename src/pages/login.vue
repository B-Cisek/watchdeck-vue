<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField } from '@nuxt/ui'

const toast = useToast()

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

// TODO: send the submitted credentials (`FormSubmitEvent.data`) to the auth API once there is one.
function onSubmit() {
  toast.add({
    title: 'Sign-in is not connected yet',
    description: 'The form is valid, but there is no auth backend to send it to.',
    icon: 'i-lucide-info',
    color: 'info',
  })
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
      title="Welcome back"
      description="Enter your credentials to access Watchdeck."
      @submit="onSubmit"
    >
      <template #leading>
        <img src="/logo.svg" alt="Watchdeck" class="mx-auto size-10" />
      </template>
    </UAuthForm>
  </UPageCard>
</template>

<route lang="yaml">
meta:
  layout: auth
</route>

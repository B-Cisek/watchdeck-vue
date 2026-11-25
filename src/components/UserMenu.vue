<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useColorMode } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const user = computed(() => {
  const email = auth.user?.email ?? ''
  return { name: email, avatar: { alt: email } }
})

async function logout() {
  try {
    await auth.logout()
  } catch {
    toast.add({
      title: 'Could not log out',
      description: 'You are still signed in. Please try again.',
      icon: 'i-lucide-circle-alert',
      color: 'error',
    })
    return
  }
  await router.push('/login')
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: '/settings',
    },
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()

            colorMode.value = 'light'
          },
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onSelect(e: Event) {
            e.preventDefault()

            colorMode.value = 'dark'
          },
        },
      ],
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: logout,
    },
  ],
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>

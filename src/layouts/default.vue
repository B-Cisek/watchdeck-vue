<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

function close() {
  open.value = false
}

const links = computed(
  () =>
    [
      { label: 'Home', icon: 'i-lucide-house', to: '/', onSelect: close },
      {
        label: 'Services',
        icon: 'i-lucide-server',
        to: '/services',
        // The page of a service is not a child route, so it would not count as active.
        active: route.path.startsWith('/services'),
        onSelect: close,
      },
      { label: 'Settings', icon: 'i-lucide-settings', to: '/settings', onSelect: close },
    ] satisfies NavigationMenuItem[],
)

const groups = computed(() => [{ id: 'links', label: 'Go to', items: links.value }])
</script>

<template>
  <UDashboardGroup unit="rem" storage="local">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <RouterLink
          to="/"
          aria-label="WatchDeck"
          class="flex items-center gap-2 px-1.5 font-semibold text-highlighted"
          @click="close"
        >
          <UIcon name="i-lucide-radar" class="size-5 shrink-0 text-primary" />
          <span v-if="!collapsed">WatchDeck</span>
        </RouterLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <RouterView />
  </UDashboardGroup>
</template>

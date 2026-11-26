<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [
  { label: 'Services', icon: 'i-lucide-server', to: '/services', exact: true },
  { label: 'Groups', icon: 'i-lucide-folder', to: '/services/groups' },
] satisfies NavigationMenuItem[]
</script>

<template>
  <UDashboardToolbar>
    <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
    <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
  </UDashboardToolbar>
</template>

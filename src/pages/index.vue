<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { useMonitoring } from '@/composables/useMonitoring'
import { overview } from '@/utils/overview'

const { services, checks, status, load } = useMonitoring()

// Results also become outdated while nothing new arrives.
const now = useNow({ interval: 10_000 })
const current = computed(() => overview(services.value, checks.value, now.value.getTime()))
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        v-if="status === 'loading'"
        class="space-y-6"
        role="status"
        aria-label="Loading overview"
      >
        <USkeleton class="h-14" />
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <USkeleton v-for="i in 4" :key="i" class="h-24" />
        </div>
        <USkeleton class="h-40" />
      </div>

      <UEmpty
        v-else-if="status === 'error'"
        role="alert"
        variant="naked"
        icon="i-lucide-circle-alert"
        title="Could not load the overview"
        description="Check your connection and try again."
        :actions="[
          { label: 'Retry', icon: 'i-lucide-refresh-cw', color: 'neutral', onClick: load },
        ]"
      />

      <UEmpty
        v-else-if="!services.length"
        variant="naked"
        icon="i-lucide-server"
        title="No services yet"
        description="Add the first service you want to monitor to see its status here."
        :actions="[{ label: 'Go to services', icon: 'i-lucide-server', to: '/services' }]"
      />

      <template v-else>
        <HomeSummary :overview="current" />

        <section
          v-if="current.problems.length"
          aria-labelledby="home-problems"
          class="shrink-0 space-y-3"
        >
          <h2 id="home-problems" class="font-semibold text-highlighted">Needs attention</h2>
          <HomeProblems :problems="current.problems" />
        </section>

        <section aria-labelledby="home-services" class="shrink-0 space-y-3">
          <h2 id="home-services" class="font-semibold text-highlighted">Services</h2>
          <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="item in current.services" :key="item.service.id" class="min-w-0">
              <HomeServiceCard :item="item" />
            </li>
          </ul>
        </section>
      </template>
    </template>
  </UDashboardPanel>
</template>

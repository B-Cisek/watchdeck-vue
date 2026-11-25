<script setup lang="ts">
import { checkTarget } from '@/utils/checks'
import type { Problem } from '@/utils/overview'

defineProps<{ problems: Problem[] }>()
</script>

<template>
  <ul class="divide-y divide-default overflow-hidden rounded-lg bg-elevated/50 ring ring-default">
    <li v-for="{ service, check, reason } in problems" :key="check.id">
      <ULink
        :to="`/services/${service.id}`"
        class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm hover:bg-elevated focus-visible:-outline-offset-2"
      >
        <HomeStateBadge :state="reason" />
        <span class="font-medium text-highlighted">{{ service.name }}</span>
        <span class="text-default">{{ check.name }}</span>
        <span class="min-w-0 truncate text-muted">{{ checkTarget(check) }}</span>
        <ServicesCheckedAt
          :last-checked-at="check.lastCheckedAt"
          class="shrink-0 text-xs text-muted sm:ms-auto"
        />
      </ULink>
    </li>
  </ul>
</template>

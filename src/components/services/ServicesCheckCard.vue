<script setup lang="ts">
import { computed } from 'vue'
import type { Check } from '@/types/check'
import { checkTarget, formatSeconds } from '@/utils/checks'

const props = defineProps<{ check: Check }>()

const details = computed(() => {
  const { check } = props
  return [
    check.type === 'http'
      ? { label: 'Expects', value: `${check.config.method} → ${check.config.expectedStatus}` }
      : { label: 'Expects', value: 'Open port' },
    { label: 'Every', value: formatSeconds(check.intervalSeconds) },
    { label: 'Timeout', value: formatSeconds(check.timeoutSeconds) },
  ]
})
</script>

<template>
  <UCard
    as="article"
    :aria-label="check.name"
    variant="subtle"
    :ui="{ body: 'p-4 sm:p-4 space-y-3' }"
  >
    <div class="flex items-center gap-2">
      <h3 class="min-w-0 truncate text-sm font-semibold text-highlighted">{{ check.name }}</h3>
      <UBadge :label="check.type.toUpperCase()" color="neutral" variant="outline" size="sm" />
      <ServicesStatusBadge :status="check.status" class="ms-auto" />
    </div>

    <p class="truncate text-sm text-muted" :title="checkTarget(check)">{{ checkTarget(check) }}</p>

    <dl class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <div v-for="{ label, value } in details" :key="label">
        <dt class="text-xs text-muted">{{ label }}</dt>
        <dd class="text-default">{{ value }}</dd>
      </div>
    </dl>

    <ServicesCheckedAt
      :last-checked-at="check.lastCheckedAt"
      class="block text-xs text-muted first-letter:uppercase"
    />
  </UCard>
</template>

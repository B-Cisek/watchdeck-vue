<script setup lang="ts">
import { computed } from 'vue'
import type { Overview } from '@/utils/overview'
import { count } from '@/utils/text'

const props = defineProps<{ overview: Overview }>()

const summary = computed(() => {
  const { down, stale, pending, up } = props.overview.counts
  const staleNote = 'Statuses may be out of date. Check that the scheduler worker is running.'

  if (down) {
    return {
      title: `${count(down, 'service')} down`,
      description: stale ? `No recent data for ${count(stale, 'more service')}.` : undefined,
      icon: 'i-lucide-circle-x',
      color: 'error',
    } as const
  }
  if (stale) {
    return {
      title: `No recent data for ${count(stale, 'service')}`,
      description: staleNote,
      icon: 'i-lucide-clock-alert',
      color: 'warning',
    } as const
  }
  if (pending) {
    return {
      title: `Waiting for results of ${count(pending, 'service')}`,
      description: 'New checks run within a few seconds.',
      icon: 'i-lucide-hourglass',
      color: 'neutral',
    } as const
  }
  if (up) {
    return {
      title: 'All monitored services are up',
      description: undefined,
      icon: 'i-lucide-circle-check',
      color: 'success',
    } as const
  }
  return {
    title: 'Nothing is monitored yet',
    description: 'Open a service and add its first check.',
    icon: 'i-lucide-circle-dashed',
    color: 'neutral',
  } as const
})

const stats = computed(() => {
  const { services, counts } = props.overview
  return [
    { label: 'Services up', value: `${counts.up} / ${services.length}` },
    { label: 'Services down', value: counts.down },
    { label: 'No recent data', value: counts.stale },
    { label: 'Without checks', value: counts.unmonitored },
  ]
})
</script>

<template>
  <UAlert
    role="status"
    variant="subtle"
    :title="summary.title"
    :description="summary.description"
    :icon="summary.icon"
    :color="summary.color"
    class="shrink-0"
  />

  <dl class="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4">
    <UCard
      v-for="{ label, value } in stats"
      :key="label"
      variant="subtle"
      :ui="{ body: 'flex flex-col gap-1 p-4 sm:p-4' }"
    >
      <dt class="text-sm text-muted">{{ label }}</dt>
      <dd class="text-2xl font-semibold text-highlighted">{{ value }}</dd>
    </UCard>
  </dl>
</template>

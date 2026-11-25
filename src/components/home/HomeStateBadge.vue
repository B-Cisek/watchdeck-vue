<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceState } from '@/utils/overview'

const props = defineProps<{ state: ServiceState }>()

const STATES = {
  down: { label: 'Down', icon: 'i-lucide-circle-x', color: 'error' },
  stale: { label: 'No recent data', icon: 'i-lucide-clock-alert', color: 'warning' },
  pending: { label: 'Pending', icon: 'i-lucide-hourglass', color: 'neutral' },
  up: { label: 'Up', icon: 'i-lucide-circle-check', color: 'success' },
  unmonitored: { label: 'No checks', icon: 'i-lucide-circle-dashed', color: 'neutral' },
} as const

const badge = computed(() => STATES[props.state])
</script>

<template>
  <UBadge
    :label="badge.label"
    :icon="badge.icon"
    :color="badge.color"
    variant="subtle"
    size="sm"
    class="shrink-0"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CheckStatus } from '@/types/check'

const props = withDefaults(defineProps<{ status: CheckStatus | 'paused'; size?: 'sm' | 'md' }>(), {
  size: 'sm',
})

const STATUS = {
  paused: { label: 'Paused', color: 'neutral' },
  pending: { label: 'Pending', color: 'neutral' },
  up: { label: 'Up', color: 'success' },
  down: { label: 'Down', color: 'error' },
} as const

const badge = computed(() => STATUS[props.status])
</script>

<template>
  <UBadge
    :label="badge.label"
    :color="badge.color"
    variant="subtle"
    :size="size"
    class="shrink-0 justify-center"
    :class="size === 'md' ? 'w-18' : 'w-16'"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CheckStatus } from '@/types/check'

const props = defineProps<{ status: CheckStatus }>()

const STATUS = {
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
    size="sm"
    class="w-16 shrink-0 justify-center"
  />
</template>

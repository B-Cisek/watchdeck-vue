<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import type { LogSource } from '@/types/log'

const props = defineProps<{
  source: LogSource
  /** Whether only its lines are shown. */
  selected?: boolean
}>()
defineEmits<{ toggle: [] }>()

const timeAgo = useTimeAgo(() => props.source.lastLogAt ?? Date.now(), {
  showSecond: true,
  updateInterval: 1000,
})
</script>

<template>
  <li class="min-w-0">
    <button
      type="button"
      :aria-pressed="selected"
      :title="
        selected ? 'Show the logs of every container' : 'Show only the logs of this container'
      "
      class="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base ring transition-colors focus-visible:outline-2 focus-visible:outline-primary"
      :class="
        selected ? 'bg-primary/10 ring-primary' : 'bg-elevated/50 ring-default hover:bg-elevated'
      "
      @click="$emit('toggle')"
    >
      <UIcon name="i-lucide-container" class="size-5 shrink-0 text-muted" />
      <span class="truncate font-medium text-highlighted">{{ source.containerName }}</span>
      <span v-if="source.host" class="shrink-0 text-muted">on {{ source.host }}</span>
      <span class="shrink-0 text-sm text-muted">
        <template v-if="source.lastLogAt">last line {{ timeAgo }}</template>
        <template v-else>waiting for logs</template>
      </span>
    </button>
  </li>
</template>

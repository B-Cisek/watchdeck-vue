<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import type { LogSource } from '@/types/log'

const props = defineProps<{ source: LogSource }>()

const timeAgo = useTimeAgo(() => props.source.lastLogAt ?? Date.now(), {
  showSecond: true,
  updateInterval: 1000,
})
</script>

<template>
  <li
    class="flex min-w-0 items-center gap-2 rounded-md bg-elevated/50 px-2.5 py-1.5 text-sm ring ring-default"
  >
    <UIcon name="i-lucide-container" class="size-4 shrink-0 text-muted" />
    <span class="truncate font-medium text-highlighted" :title="source.containerName">
      {{ source.containerName }}
    </span>
    <span v-if="source.host" class="shrink-0 text-muted">on {{ source.host }}</span>
    <span class="shrink-0 text-xs text-muted">
      <template v-if="source.lastLogAt">last line {{ timeAgo }}</template>
      <template v-else>waiting for logs</template>
    </span>
  </li>
</template>

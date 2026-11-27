<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import { format } from 'date-fns'
import type { LogLine } from '@/types/log'
import { filterLogs, type LogFilter } from '@/utils/logs'

const props = defineProps<{
  lines: LogLine[]
  /** Only the lines of this log source; `null` for all of them. */
  sourceId?: string | null
}>()

const streamItems = [
  { label: 'All streams', value: 'all' },
  { label: 'stdout', value: 'stdout' },
  { label: 'stderr', value: 'stderr' },
]

const filter = reactive<Omit<LogFilter, 'sourceId'>>({ query: '', stream: 'all' })
const visibleLines = computed(() =>
  filterLogs(props.lines, { ...filter, sourceId: props.sourceId ?? null }),
)

// The newest lines are at the bottom, like in a terminal. New lines keep the view at the
// bottom, unless the reader scrolled up to read older ones.
const list = useTemplateRef('list')
const followsNewLines = ref(true)

function onScroll() {
  const element = list.value
  if (element) {
    followsNewLines.value = element.scrollHeight - element.scrollTop - element.clientHeight < 32
  }
}

watch(
  [list, visibleLines],
  ([element]) => {
    if (element && followsNewLines.value) {
      element.scrollTop = element.scrollHeight
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <UInput
        v-model="filter.query"
        icon="i-lucide-search"
        placeholder="Search logs…"
        aria-label="Search logs"
        size="lg"
        class="w-full sm:max-w-80"
      />
      <USelect
        v-model="filter.stream"
        :items="streamItems"
        aria-label="Stream"
        size="lg"
        class="w-full sm:w-40"
      />
    </div>

    <div
      ref="list"
      role="region"
      aria-label="Log lines"
      tabindex="0"
      @scroll="onScroll"
      class="h-96 overflow-y-auto rounded-lg bg-elevated/50 p-3 font-mono text-sm ring ring-default focus-visible:outline-2 focus-visible:outline-primary"
    >
      <p v-if="!visibleLines.length" class="text-muted">
        {{
          lines.length
            ? 'No lines match the filters.'
            : 'No lines yet. They show up a few seconds after the container writes them.'
        }}
      </p>
      <div
        v-for="line in visibleLines"
        :key="line.id"
        class="flex flex-wrap gap-x-3 py-0.5 sm:flex-nowrap"
      >
        <time :datetime="line.loggedAt" class="shrink-0 text-muted">
          {{ format(line.loggedAt, 'MMM d HH:mm:ss') }}
        </time>
        <span class="w-32 shrink-0 truncate text-muted" :title="line.container">
          {{ line.container }}
        </span>
        <span class="w-14 shrink-0" :class="line.stream === 'stderr' ? 'text-error' : 'text-muted'">
          {{ line.stream }}
        </span>
        <span class="min-w-0 wrap-anywhere text-default">{{ line.message }}</span>
      </div>
    </div>
  </div>
</template>

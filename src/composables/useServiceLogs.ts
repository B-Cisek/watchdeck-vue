import { ref, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { logs as logsApi } from '@/api/logs'
import type { LogLine, LogSource } from '@/types/log'

/** A service's log sources and newest lines, kept current while the page is visible. */
export function useServiceLogs(serviceId: () => string) {
  const sources = ref<LogSource[]>([])
  const lines = ref<LogLine[]>([])
  const status = ref<'loading' | 'ready' | 'error'>('loading')

  async function fetch(id: string) {
    return Promise.all([logsApi.sources(id), logsApi.lines(id)])
  }

  async function load() {
    const id = serviceId()
    status.value = 'loading'
    try {
      const [sourceList, lineList] = await fetch(id)
      // The route may have moved to another service meanwhile.
      if (id !== serviceId()) {
        return
      }
      sources.value = sourceList
      lines.value = lineList
      status.value = 'ready'
    } catch {
      if (id === serviceId()) {
        status.value = 'error'
      }
    }
  }

  async function refresh() {
    const id = serviceId()
    if (status.value !== 'ready' || document.hidden) {
      return
    }
    const before = sources.value
    try {
      const [sourceList, lineList] = await fetch(id)
      if (id !== serviceId()) {
        return
      }
      // A source added in the meantime may be missing from this response.
      if (sources.value === before) {
        sources.value = sourceList
      }
      lines.value = lineList
    } catch {
      // The next refresh tries again.
    }
  }

  function addSource(source: LogSource) {
    sources.value = [...sources.value, source]
  }

  watch(serviceId, load, { immediate: true })
  useIntervalFn(refresh, 5_000)

  return { sources, lines, status, load, addSource }
}

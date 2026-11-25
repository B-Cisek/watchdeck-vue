import type { Ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { checks as checksApi } from '@/api/checks'
import type { Check } from '@/types/check'

/** Keeps statuses current; a failed refresh shows as a growing "checked … ago". */
export function useCheckRefresh(checks: Ref<Check[]>, isReady: () => boolean): void {
  useIntervalFn(async () => {
    if (!isReady() || document.hidden) {
      return
    }
    const before = checks.value
    try {
      const checkList = await checksApi.list()
      // A check added in the meantime may be missing from this response.
      if (checks.value === before) {
        checks.value = checkList
      }
    } catch {
      // The next refresh tries again.
    }
  }, 10_000)
}

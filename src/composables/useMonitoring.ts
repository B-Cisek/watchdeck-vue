import { ref } from 'vue'
import { checks as checksApi } from '@/api/checks'
import { services as servicesApi } from '@/api/services'
import type { Check } from '@/types/check'
import type { Service } from '@/types/service'
import { useCheckRefresh } from './useCheckRefresh'

/** All services with their checks, loaded right away; checks stay current. */
export function useMonitoring() {
  const services = ref<Service[]>([])
  const checks = ref<Check[]>([])
  const status = ref<'loading' | 'ready' | 'error'>('loading')

  async function load() {
    status.value = 'loading'
    try {
      const [serviceList, checkList] = await Promise.all([servicesApi.list(), checksApi.list()])
      services.value = serviceList
      checks.value = checkList
      status.value = 'ready'
    } catch {
      status.value = 'error'
    }
  }

  load()
  useCheckRefresh(checks, () => status.value === 'ready')

  return { services, checks, status, load }
}

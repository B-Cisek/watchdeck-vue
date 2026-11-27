import type { Check, CreateCheck } from '@/types/check'
import { api, ignoreNotFound } from '@/utils/api'

export const checks = {
  async list(): Promise<Check[]> {
    const { data } = await api.get<Check[]>('/checks')
    return data
  },

  async create(serviceId: string, check: CreateCheck): Promise<Check> {
    const { data } = await api.post<Check>(`/services/${serviceId}/checks`, check)
    return data
  },

  /** Replaces the whole check. A new type or config starts it over as pending, a resumed one runs right away. */
  async update(id: string, check: CreateCheck): Promise<Check> {
    const { data } = await api.put<Check>(`/checks/${id}`, check)
    return data
  },

  /** Its history goes with it. A check that is already gone counts as removed. */
  remove(id: string): Promise<void> {
    return ignoreNotFound(api.delete(`/checks/${id}`))
  },
}

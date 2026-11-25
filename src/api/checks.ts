import type { Check, CreateCheck } from '@/types/check'
import { api } from '@/utils/api'

export const checks = {
  async list(): Promise<Check[]> {
    const { data } = await api.get<Check[]>('/checks')
    return data
  },

  async create(serviceId: string, check: CreateCheck): Promise<Check> {
    const { data } = await api.post<Check>(`/services/${serviceId}/checks`, check)
    return data
  },
}

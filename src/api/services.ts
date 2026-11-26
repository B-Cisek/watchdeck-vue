import type { CreateService, Service } from '@/types/service'
import { api, ignoreNotFound } from '@/utils/api'

export const services = {
  async list(): Promise<Service[]> {
    const { data } = await api.get<Service[]>('/services')
    return data
  },

  async create(service: CreateService): Promise<Service> {
    const { data } = await api.post<Service>('/services', service)
    return data
  },

  async rename(id: string, name: string): Promise<Service> {
    const { data } = await api.patch<Service>(`/services/${id}`, { name })
    return data
  },

  /** Its checks and their history go with it. A service that is already gone counts as removed. */
  remove(id: string): Promise<void> {
    return ignoreNotFound(api.delete(`/services/${id}`))
  },
}

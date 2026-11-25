import type { CreateService, Service } from '@/types/service'
import { api } from '@/utils/api'

export const services = {
  async list(): Promise<Service[]> {
    const { data } = await api.get<Service[]>('/services')
    return data
  },

  async create(service: CreateService): Promise<Service> {
    const { data } = await api.post<Service>('/services', service)
    return data
  },
}

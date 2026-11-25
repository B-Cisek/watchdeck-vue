import type { CreateServiceGroup, ServiceGroup } from '@/types/service'
import { api } from '@/utils/api'

export const serviceGroups = {
  async list(): Promise<ServiceGroup[]> {
    const { data } = await api.get<ServiceGroup[]>('/service-groups')
    return data
  },

  async create(group: CreateServiceGroup): Promise<ServiceGroup> {
    const { data } = await api.post<ServiceGroup>('/service-groups', group)
    return data
  },
}

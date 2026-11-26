import type { CreateServiceGroup, ServiceGroup } from '@/types/service'
import { api, ignoreNotFound } from '@/utils/api'

export const serviceGroups = {
  async list(): Promise<ServiceGroup[]> {
    const { data } = await api.get<ServiceGroup[]>('/service-groups')
    return data
  },

  async create(group: CreateServiceGroup): Promise<ServiceGroup> {
    const { data } = await api.post<ServiceGroup>('/service-groups', group)
    return data
  },

  async update(id: string, group: CreateServiceGroup): Promise<ServiceGroup> {
    const { data } = await api.put<ServiceGroup>(`/service-groups/${id}`, group)
    return data
  },

  /** Its services stay, without a group. A group that is already gone counts as removed. */
  remove(id: string): Promise<void> {
    return ignoreNotFound(api.delete(`/service-groups/${id}`))
  },
}

import type { AddedLogSource, AddLogSource, LogLine, LogSource } from '@/types/log'
import { api } from '@/utils/api'

export const logs = {
  async sources(serviceId: string): Promise<LogSource[]> {
    const { data } = await api.get<LogSource[]>(`/services/${serviceId}/log-sources`)
    return data
  },

  /** Returns the Vector config that sends the container's logs here. */
  async addSource(serviceId: string, source: AddLogSource): Promise<AddedLogSource> {
    const { data } = await api.post<AddedLogSource>(`/services/${serviceId}/log-sources`, source)
    return data
  },

  /** The newest lines of all the service's containers, oldest first. */
  async lines(serviceId: string, limit = 500): Promise<LogLine[]> {
    const { data } = await api.get<LogLine[]>(`/services/${serviceId}/logs`, { params: { limit } })
    return data
  },
}

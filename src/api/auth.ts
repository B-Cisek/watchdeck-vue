import type { LoginCredentials, User } from '@/types/auth'
import { api } from '@/utils/api'

export const auth = {
  async login({ email, password, remember = false }: LoginCredentials): Promise<User> {
    const { data } = await api.post<User>('/login', { email, password, _remember_me: remember })
    return data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/me', { timeout: 10_000 })
    return data
  },
}

import { config } from '@/config/env'
import axios, { isAxiosError } from 'axios'

export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

// A 401 from these is an expected answer, not an expired session.
const EXPECTED_401 = ['/login', '/me']

let onUnauthorized: () => void = () => {}

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    !EXPECTED_401.includes(error.config?.url ?? '')
  ) {
    onUnauthorized()
  }
  return Promise.reject(error)
})

/** For a delete: what is already gone counts as deleted. */
export async function ignoreNotFound(request: Promise<unknown>): Promise<void> {
  try {
    await request
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) {
      throw error
    }
  }
}

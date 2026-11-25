import { afterEach, expect, test } from 'bun:test'
import type { InternalAxiosRequestConfig } from 'axios'
import { auth } from '@/api/auth'
import { api } from '@/utils/api'

const originalAdapter = api.defaults.adapter

afterEach(() => {
  api.defaults.adapter = originalAdapter
})

// The first page waits for this request, so a hanging server must not block it forever.
test('me gives up after 10 seconds', async () => {
  let timeout: number | undefined
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    timeout = config.timeout
    return { status: 200, statusText: '', headers: {}, config, data: {} }
  }

  await auth.me()

  expect(timeout).toBe(10_000)
})

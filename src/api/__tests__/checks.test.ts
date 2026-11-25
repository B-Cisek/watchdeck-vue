import { afterEach, expect, test } from 'bun:test'
import type { InternalAxiosRequestConfig } from 'axios'
import { checks } from '@/api/checks'
import type { Check, CreateCheck } from '@/types/check'
import { api } from '@/utils/api'

const originalAdapter = api.defaults.adapter

function respondWith(data: unknown) {
  const requests: { method?: string; url?: string; body: unknown }[] = []
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    requests.push({
      method: config.method,
      url: config.url,
      body: config.data && JSON.parse(config.data),
    })
    return { status: 200, statusText: '', headers: {}, config, data }
  }
  return requests
}

afterEach(() => {
  api.defaults.adapter = originalAdapter
})

const create: CreateCheck = {
  name: 'Database',
  type: 'tcp',
  config: { host: 'shop-db', port: 5432 },
  intervalSeconds: 60,
  timeoutSeconds: 5,
}
const check: Check = {
  ...create,
  id: 'c1',
  serviceId: 's1',
  status: 'pending',
  lastCheckedAt: null,
}

test('lists checks', async () => {
  const requests = respondWith([check])

  expect(await checks.list()).toEqual([check])
  expect(requests).toEqual([{ method: 'get', url: '/checks', body: undefined }])
})

test('creates a check of a service', async () => {
  const requests = respondWith(check)

  expect(await checks.create('s1', create)).toEqual(check)
  expect(requests).toEqual([{ method: 'post', url: '/services/s1/checks', body: create }])
})

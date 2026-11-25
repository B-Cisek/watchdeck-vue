import { afterEach, expect, test } from 'bun:test'
import type { InternalAxiosRequestConfig } from 'axios'
import { services } from '@/api/services'
import { serviceGroups } from '@/api/serviceGroups'
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

const ecommerce = { id: 'g1', name: 'ecommerce' }
const nike = { id: 's1', name: 'Nike', group: ecommerce }

test('lists services', async () => {
  const requests = respondWith([nike])

  expect(await services.list()).toEqual([nike])
  expect(requests).toEqual([{ method: 'get', url: '/services', body: undefined }])
})

test('creates a service in a group', async () => {
  const requests = respondWith(nike)

  expect(await services.create({ name: 'Nike', groupId: 'g1' })).toEqual(nike)
  expect(requests).toEqual([
    { method: 'post', url: '/services', body: { name: 'Nike', groupId: 'g1' } },
  ])
})

test('lists groups', async () => {
  const requests = respondWith([ecommerce])

  expect(await serviceGroups.list()).toEqual([ecommerce])
  expect(requests).toEqual([{ method: 'get', url: '/service-groups', body: undefined }])
})

test('creates a group', async () => {
  const requests = respondWith(ecommerce)

  expect(await serviceGroups.create({ name: 'ecommerce' })).toEqual(ecommerce)
  expect(requests).toEqual([
    { method: 'post', url: '/service-groups', body: { name: 'ecommerce' } },
  ])
})

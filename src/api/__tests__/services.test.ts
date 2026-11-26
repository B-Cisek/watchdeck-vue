import { afterEach, expect, test } from 'bun:test'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
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

function failWith(status: number) {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const response = { status, statusText: '', headers: {}, config, data: {} }
    throw new AxiosError('failed', undefined, config, undefined, response)
  }
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

test('renames a service', async () => {
  const store = { ...nike, name: 'Nike Store' }
  const requests = respondWith(store)

  expect(await services.rename('s1', 'Nike Store')).toEqual(store)
  expect(requests).toEqual([{ method: 'patch', url: '/services/s1', body: { name: 'Nike Store' } }])
})

test('removes a service', async () => {
  const requests = respondWith('')

  await services.remove('s1')
  expect(requests).toEqual([{ method: 'delete', url: '/services/s1', body: undefined }])
})

// Someone else removed it first: the outcome the user asked for.
test('treats a service that is already gone as removed', async () => {
  failWith(404)

  await expect(services.remove('s1')).resolves.toBeUndefined()
})

test('rejects when a service cannot be removed', async () => {
  failWith(500)

  await expect(services.remove('s1')).rejects.toThrow()
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

test('renames a group', async () => {
  const requests = respondWith({ id: 'g1', name: 'shops' })

  expect(await serviceGroups.update('g1', { name: 'shops' })).toEqual({ id: 'g1', name: 'shops' })
  expect(requests).toEqual([{ method: 'put', url: '/service-groups/g1', body: { name: 'shops' } }])
})

test('removes a group', async () => {
  const requests = respondWith('')

  await serviceGroups.remove('g1')
  expect(requests).toEqual([{ method: 'delete', url: '/service-groups/g1', body: undefined }])
})

test('treats a group that is already gone as removed', async () => {
  failWith(404)

  await expect(serviceGroups.remove('g1')).resolves.toBeUndefined()
})

test('rejects when a group cannot be removed', async () => {
  failWith(500)

  await expect(serviceGroups.remove('g1')).rejects.toThrow()
})

import { afterEach, expect, test } from 'bun:test'
import type { InternalAxiosRequestConfig } from 'axios'
import { logs } from '@/api/logs'
import type { AddedLogSource, LogLine, LogSource } from '@/types/log'
import { api } from '@/utils/api'

const originalAdapter = api.defaults.adapter

function respondWith(data: unknown) {
  const requests: { method?: string; url?: string; params?: unknown; body: unknown }[] = []
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    requests.push({
      method: config.method,
      url: config.url,
      params: config.params,
      body: config.data && JSON.parse(config.data),
    })
    return { status: 200, statusText: '', headers: {}, config, data }
  }
  return requests
}

afterEach(() => {
  api.defaults.adapter = originalAdapter
})

const source: LogSource = {
  id: 'ls1',
  serviceId: 's1',
  containerName: 'shop-app-1',
  host: 'vps-1',
  lastLogAt: null,
}

test('lists log sources of a service', async () => {
  const requests = respondWith([source])

  expect(await logs.sources('s1')).toEqual([source])
  expect(requests).toEqual([
    { method: 'get', url: '/services/s1/log-sources', params: undefined, body: undefined },
  ])
})

test('adds a log source and returns its Vector config', async () => {
  const added: AddedLogSource = {
    logSource: source,
    vectorConfig: { fileName: 'watchdeck-ls1.yaml', content: 'sources: {}' },
  }
  const requests = respondWith(added)

  expect(await logs.addSource('s1', { containerName: 'shop-app-1', host: 'vps-1' })).toEqual(added)
  expect(requests).toEqual([
    {
      method: 'post',
      url: '/services/s1/log-sources',
      params: undefined,
      body: { containerName: 'shop-app-1', host: 'vps-1' },
    },
  ])
})

test('reads the newest lines of a service', async () => {
  const line: LogLine = {
    id: 1,
    sourceId: 'ls1',
    container: 'shop-app-1',
    loggedAt: '2026-11-26T10:00:00+00:00',
    stream: 'stdout',
    message: 'GET / 200',
  }
  const requests = respondWith([line])

  expect(await logs.lines('s1')).toEqual([line])
  expect(requests).toEqual([
    { method: 'get', url: '/services/s1/logs', params: { limit: 500 }, body: undefined },
  ])
})

import { describe, expect, test } from 'bun:test'
import type { Check, CheckStatus } from '@/types/check'
import {
  checksByService,
  checkSchema,
  checkTarget,
  formatSeconds,
  serviceStatus,
} from '@/utils/checks'

const common = {
  serviceId: 's1',
  enabled: true,
  intervalSeconds: 60,
  timeoutSeconds: 5,
  status: 'up',
  lastCheckedAt: null,
} as const
const home: Check = {
  ...common,
  id: 'c1',
  name: 'Home',
  type: 'http',
  config: { url: 'https://shop.com', method: 'GET', expectedStatus: 200 },
}
const database: Check = {
  ...common,
  id: 'c2',
  name: 'database',
  type: 'tcp',
  config: { host: 'shop-db', port: 5432 },
}

describe('checksByService', () => {
  test('keeps checks of each service apart, sorted by name', () => {
    const other: Check = { ...home, id: 'c3', serviceId: 's2' }

    expect(checksByService([home, other, database])).toEqual(
      new Map([
        ['s1', [database, home]],
        ['s2', [other]],
      ]),
    )
  })

  test('does not change the list it is given', () => {
    const list = [home, database]

    checksByService(list)

    expect(list).toEqual([home, database])
  })
})

describe('checkTarget', () => {
  test.each([
    [home, 'https://shop.com'],
    [database, 'shop-db:5432'],
  ])('shows what is checked', (check, target) => {
    expect(checkTarget(check)).toBe(target)
  })
})

describe('serviceStatus', () => {
  test.each<[CheckStatus | null, CheckStatus[]]>([
    [null, []],
    ['up', ['up', 'up']],
    ['down', ['up', 'pending', 'down']],
    ['pending', ['up', 'pending']],
  ])('is %p for %p', (expected, statuses) => {
    expect(serviceStatus(statuses.map((status) => ({ ...home, status })))).toBe(expected)
  })

  test('leaves out paused checks', () => {
    const paused = { ...home, status: 'down', enabled: false } as const

    expect(serviceStatus([paused, home])).toBe('up')
    expect(serviceStatus([paused])).toBeNull()
  })
})

describe('formatSeconds', () => {
  test.each([
    [5, '5 s'],
    [60, '1 min'],
    [90, '90 s'],
    [900, '15 min'],
    [3600, '1 h'],
    [5400, '90 min'],
  ])('formats %p as %p', (seconds, expected) => {
    expect(formatSeconds(seconds)).toBe(expected)
  })
})

describe('checkSchema', () => {
  // The form keeps the fields of both types, so switching the type does not lose them.
  const form = {
    name: ' Home ',
    type: 'http',
    config: {
      url: ' https://shop.com ',
      method: 'GET',
      expectedStatus: 200,
      host: '',
      port: undefined,
    },
    intervalSeconds: 60,
    timeoutSeconds: 5,
    enabled: true,
  }

  function paths(value: unknown) {
    return checkSchema.safeParse(value).error?.issues.map(({ path }) => path.join('.'))
  }

  test('keeps only the fields of an HTTP check', () => {
    expect(checkSchema.parse(form)).toEqual({
      name: 'Home',
      type: 'http',
      config: { url: 'https://shop.com', method: 'GET', expectedStatus: 200 },
      intervalSeconds: 60,
      timeoutSeconds: 5,
      enabled: true,
    })
  })

  test('keeps only the fields of a TCP check', () => {
    const config = { ...form.config, url: '', host: ' shop-db ', port: 5432 }

    expect(checkSchema.parse({ ...form, type: 'tcp', config })).toEqual({
      name: 'Home',
      type: 'tcp',
      config: { host: 'shop-db', port: 5432 },
      intervalSeconds: 60,
      timeoutSeconds: 5,
      enabled: true,
    })
  })

  test('accepts an internal host', () => {
    expect(paths({ ...form, config: { ...form.config, url: 'http://shop-app:8080/up' } })).toBe(
      undefined,
    )
  })

  test.each([
    ['name', { ...form, name: '  ' }],
    ['config.url', { ...form, config: { ...form.config, url: '' } }],
    ['config.url', { ...form, config: { ...form.config, url: 'ftp://shop.com' } }],
    ['config.expectedStatus', { ...form, config: { ...form.config, expectedStatus: 600 } }],
    ['timeoutSeconds', { ...form, timeoutSeconds: 61 }],
    ['timeoutSeconds', { ...form, timeoutSeconds: null }],
  ])('reports %s', (path, value) => {
    expect(paths(value)).toEqual([path])
  })

  test('reports missing host and port', () => {
    expect(paths({ ...form, type: 'tcp' })).toEqual(['config.host', 'config.port'])
  })
})

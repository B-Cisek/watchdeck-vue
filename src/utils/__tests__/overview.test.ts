import { describe, expect, test } from 'bun:test'
import type { Check, CheckStatus } from '@/types/check'
import type { Service } from '@/types/service'
import { isStale, overview, type ServiceState } from '@/utils/overview'

const now = Date.parse('2026-11-25T12:00:00Z')

function ago(seconds: number): string {
  return new Date(now - seconds * 1000).toISOString()
}

function service(id: string, name = id): Service {
  return { id, name, group: null }
}

function check(serviceId: string, status: CheckStatus, changes: Partial<Check> = {}): Check {
  return {
    id: `${serviceId}-${status}`,
    serviceId,
    name: status,
    type: 'tcp',
    config: { host: 'db', port: 5432 },
    intervalSeconds: 60,
    timeoutSeconds: 5,
    status,
    lastCheckedAt: status === 'pending' ? null : ago(10),
    ...changes,
  } as Check
}

describe('isStale', () => {
  test.each([
    ['a recent result', 60, 100, false],
    // The scheduler runs every 10 s, so a short interval alone would raise false alarms.
    ['a short interval within 3 minutes', 10, 170, false],
    ['a short interval after 3 minutes', 10, 190, true],
    ['a long interval within 3 runs', 3600, 10_000, false],
    ['a long interval after 3 runs', 3600, 10_900, true],
  ])('%s', (_, intervalSeconds, seconds, expected) => {
    expect(isStale(check('s', 'up', { intervalSeconds, lastCheckedAt: ago(seconds) }), now)).toBe(
      expected,
    )
  })

  test('a check that has not run yet', () => {
    expect(isStale(check('s', 'pending'), now)).toBe(false)
  })
})

describe('overview', () => {
  const old = { lastCheckedAt: ago(3600) }

  test.each<[ServiceState, Check[]]>([
    ['unmonitored', []],
    ['up', [check('s', 'up')]],
    ['pending', [check('s', 'up'), check('s', 'pending')]],
    ['stale', [check('s', 'up', old), check('s', 'pending')]],
    ['down', [check('s', 'up', old), check('s', 'down')]],
    // Nobody looked lately, but the last known state is still the one to act on.
    ['down', [check('s', 'down', old)]],
  ])('a service is %s', (state, checks) => {
    const result = overview([service('s')], checks, now)

    expect(result.services.map((item) => item.state)).toEqual([state])
    expect(result.counts).toEqual({
      down: 0,
      stale: 0,
      pending: 0,
      up: 0,
      unmonitored: 0,
      [state]: 1,
    })
  })

  test('counts how many checks of a service are up', () => {
    const checks = [check('s', 'up'), check('s', 'down'), check('other', 'up')]

    expect(overview([service('s')], checks, now).services[0]).toMatchObject({ up: 1, total: 2 })
  })

  test('does not count an outdated result as up', () => {
    expect(overview([service('s')], [check('s', 'up', old)], now).services[0]).toMatchObject({
      up: 0,
      total: 1,
    })
  })

  test('sorts services by how much they need attention, then by name', () => {
    const services = ['idle', 'b', 'a', 'broken', 'old', 'new'].map((id) => service(id))
    const checks = [
      check('b', 'up'),
      check('a', 'up'),
      check('broken', 'down'),
      check('old', 'up', old),
      check('new', 'pending'),
    ]

    expect(overview(services, checks, now).services.map((item) => item.service.id)).toEqual([
      'broken',
      'old',
      'new',
      'a',
      'b',
      'idle',
    ])
  })

  test('lists checks that are down or outdated, down first', () => {
    const outdated = check('s', 'up', old)
    const down = check('s', 'down')

    const shop = service('s', 'shop')
    expect(overview([shop], [outdated, check('s', 'pending'), down], now).problems).toEqual([
      { service: shop, check: down, reason: 'down' },
      { service: shop, check: outdated, reason: 'stale' },
    ])
  })

  // Both lists are fetched separately, so a service can be created in between.
  test('leaves out checks of an unknown service', () => {
    expect(overview([], [check('s', 'down')], now).problems).toEqual([])
  })
})

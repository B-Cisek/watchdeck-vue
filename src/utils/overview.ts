import type { Check } from '@/types/check'
import type { Service } from '@/types/service'

/** From the one that needs attention most. */
const STATES = ['down', 'stale', 'pending', 'up', 'unmonitored'] as const

export type ServiceState = (typeof STATES)[number]

export interface ServiceOverview {
  service: Service
  state: ServiceState
  up: number
  total: number
}

export interface Problem {
  service: Service
  check: Check
  reason: 'down' | 'stale'
}

export interface Overview {
  services: ServiceOverview[]
  counts: Record<ServiceState, number>
  problems: Problem[]
}

const MIN_STALE_SECONDS = 180

/** Whether the last result is too old to tell the current state. */
export function isStale(check: Check, now: number): boolean {
  if (!check.lastCheckedAt) {
    return false
  }
  const age = (now - Date.parse(check.lastCheckedAt)) / 1000
  return age > Math.max(3 * check.intervalSeconds, MIN_STALE_SECONDS)
}

function checkState(check: Check, now: number): ServiceState {
  return check.status !== 'down' && isStale(check, now) ? 'stale' : check.status
}

export function overview(services: Service[], checks: Check[], now: number): Overview {
  const counts = { down: 0, stale: 0, pending: 0, up: 0, unmonitored: 0 }
  const problems: Problem[] = []

  const items = services.map((service): ServiceOverview => {
    const states = checks
      .filter(({ serviceId }) => serviceId === service.id)
      .map((check) => {
        const state = checkState(check, now)
        if (state === 'down' || state === 'stale') {
          problems.push({ service, check, reason: state })
        }
        return state
      })
    const state = STATES.find((candidate) => states.includes(candidate)) ?? 'unmonitored'
    counts[state]++

    return { service, state, up: states.filter((s) => s === 'up').length, total: states.length }
  })

  return {
    services: items.sort(
      (a, b) =>
        STATES.indexOf(a.state) - STATES.indexOf(b.state) ||
        a.service.name.localeCompare(b.service.name),
    ),
    counts,
    problems: problems.sort((a, b) => STATES.indexOf(a.reason) - STATES.indexOf(b.reason)),
  }
}

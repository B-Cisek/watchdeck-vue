import * as z from 'zod'
import type { Check, CheckStatus, CheckTarget } from '@/types/check'

const common = {
  name: z.string().trim().min(1, 'Name is required').max(100, 'Use 100 characters or fewer'),
  intervalSeconds: z.number(),
  timeoutSeconds: z
    .number('Timeout is required')
    .int('Use a whole number')
    .min(1, 'Use 1 to 60 seconds')
    .max(60, 'Use 1 to 60 seconds'),
  enabled: z.boolean(),
}

/** Form values of both check types in, the request body of the chosen type out. */
export const checkSchema = z.discriminatedUnion('type', [
  z.object({
    ...common,
    type: z.literal('http'),
    config: z.object({
      url: z
        .string()
        .trim()
        .pipe(
          z.url({ protocol: /^https?$/, error: 'Enter a URL starting with http:// or https://' }),
        ),
      method: z.enum(['GET', 'HEAD']),
      expectedStatus: z
        .number('Status is required')
        .int('Use a whole number')
        .min(100, 'Use 100 to 599')
        .max(599, 'Use 100 to 599'),
    }),
  }),
  z.object({
    ...common,
    type: z.literal('tcp'),
    config: z.object({
      host: z.string().trim().min(1, 'Host is required'),
      port: z
        .number('Port is required')
        .int('Use a whole number')
        .min(1, 'Use 1 to 65535')
        .max(65535, 'Use 1 to 65535'),
    }),
  }),
])

/** Checks sorted by name, by the id of their service. */
export function checksByService(checks: Check[]): Map<string, Check[]> {
  const result = new Map<string, Check[]>()
  for (const check of [...checks].sort((a, b) => a.name.localeCompare(b.name))) {
    result.set(check.serviceId, [...(result.get(check.serviceId) ?? []), check])
  }
  return result
}

export function checkTarget(check: CheckTarget): string {
  return check.type === 'http' ? check.config.url : `${check.config.host}:${check.config.port}`
}

/** The worst status among the running checks; `null` without any. */
export function serviceStatus(checks: Check[]): CheckStatus | null {
  const order: CheckStatus[] = ['down', 'pending', 'up']
  const running = checks.filter(({ enabled }) => enabled)
  return order.find((status) => running.some((check) => check.status === status)) ?? null
}

/** In the largest unit that gives a whole number. */
export function formatSeconds(seconds: number): string {
  if (seconds % 3600 === 0) {
    return `${seconds / 3600} h`
  }
  return seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`
}

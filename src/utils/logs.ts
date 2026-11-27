import * as z from 'zod'
import type { LogLine, LogStream } from '@/types/log'

export interface LogFilter {
  query: string
  stream: LogStream | 'all'
  /** Only the lines of this log source; `null` for all of them. */
  sourceId: string | null
}

export function filterLogs(lines: LogLine[], { query, stream, sourceId }: LogFilter): LogLine[] {
  const search = query.trim().toLowerCase()

  return lines.filter(
    (line) =>
      (sourceId === null || line.sourceId === sourceId) &&
      (stream === 'all' || line.stream === stream) &&
      (line.message.toLowerCase().includes(search) ||
        line.container.toLowerCase().includes(search)),
  )
}

/** Same rules as the API: Docker's own rule for container names. */
export const logSourceSchema = z.object({
  containerName: z
    .string()
    .trim()
    .min(1, 'Container name is required')
    .max(255, 'Use 255 characters or fewer')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/, 'Use the name docker ps shows: letters, digits, _ . -'),
  host: z
    .string()
    .trim()
    .max(100, 'Use 100 characters or fewer')
    .transform((host) => host || null),
})

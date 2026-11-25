import type { LogLine, LogStream } from '@/types/log'

export interface LogFilter {
  query: string
  stream: LogStream | 'all'
}

export function filterLogs(lines: LogLine[], { query, stream }: LogFilter): LogLine[] {
  const search = query.trim().toLowerCase()

  return lines.filter(
    (line) =>
      (stream === 'all' || line.stream === stream) &&
      (line.message.toLowerCase().includes(search) ||
        line.container.toLowerCase().includes(search)),
  )
}

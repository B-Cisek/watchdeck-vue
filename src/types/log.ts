export type LogStream = 'stdout' | 'stderr'

export interface LogLine {
  id: string
  container: string
  loggedAt: string
  stream: LogStream
  message: string
}

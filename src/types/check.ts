export type CheckStatus = 'pending' | 'up' | 'down'
export type HttpCheckMethod = 'GET' | 'HEAD'

export interface HttpCheckTarget {
  type: 'http'
  config: { url: string; method: HttpCheckMethod; expectedStatus: number }
}

export interface TcpCheckTarget {
  type: 'tcp'
  config: { host: string; port: number }
}

export type CheckTarget = HttpCheckTarget | TcpCheckTarget

export type CreateCheck = CheckTarget & {
  name: string
  intervalSeconds: number
  timeoutSeconds: number
  /** A paused check is not run and does not count towards the status of its service. */
  enabled: boolean
}

export type Check = CreateCheck & {
  id: string
  serviceId: string
  status: CheckStatus
  lastCheckedAt: string | null
}

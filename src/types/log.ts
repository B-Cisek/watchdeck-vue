export type LogStream = 'stdout' | 'stderr'

export interface LogLine {
  id: number
  container: string
  loggedAt: string
  stream: LogStream
  message: string
}

/** A container whose logs a service shows. */
export interface LogSource {
  id: string
  serviceId: string
  containerName: string
  host: string | null
  /** Null until Vector sends the first line. */
  lastLogAt: string | null
}

export interface AddLogSource {
  containerName: string
  host: string | null
}

/** A Vector config file for the server that runs the container. */
export interface VectorConfig {
  fileName: string
  content: string
}

export interface AddedLogSource {
  logSource: LogSource
  vectorConfig: VectorConfig
}

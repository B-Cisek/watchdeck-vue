import type { LogLine, LogStream } from '@/types/log'

const SAMPLES: [container: string, stream: LogStream, message: string][] = [
  ['app', 'stdout', 'Server listening on :8080'],
  ['app', 'stdout', 'GET /health 200 4ms'],
  ['db', 'stdout', 'database system is ready to accept connections'],
  ['app', 'stdout', 'GET /products?page=2 200 38ms'],
  ['worker', 'stdout', 'Consuming messages from transport "async"'],
  ['app', 'stderr', 'Slow query (1240ms): SELECT * FROM products WHERE category_id = $1'],
  ['worker', 'stdout', 'Message SendOrderConfirmation handled successfully'],
  ['app', 'stdout', 'POST /cart 201 52ms'],
  [
    'worker',
    'stderr',
    'Message SyncInventory failed: connection timed out after 5000ms, retry 1/3',
  ],
  ['app', 'stdout', 'GET /health 200 3ms'],
  ['db', 'stdout', 'checkpoint complete: wrote 42 buffers (0.3%)'],
  ['app', 'stderr', 'Unhandled exception: payment gateway responded with status 502'],
]

/** Stands in for the logs API, which does not exist yet. */
export function sampleLogs(now = Date.now()): LogLine[] {
  return Array.from({ length: 5 }, () => SAMPLES)
    .flat()
    .map(([container, stream, message], index, all) => ({
      id: String(index),
      container,
      loggedAt: new Date(now - (all.length - index) * 7_000).toISOString(),
      stream,
      message,
    }))
}

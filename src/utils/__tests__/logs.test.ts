import { describe, expect, test } from 'bun:test'
import type { LogLine } from '@/types/log'
import { filterLogs } from '@/utils/logs'

const started: LogLine = {
  id: 'l1',
  container: 'shop-app',
  loggedAt: '2026-11-25T10:00:00Z',
  stream: 'stdout',
  message: 'Server started',
}
const failed: LogLine = {
  id: 'l2',
  container: 'shop-db',
  loggedAt: '2026-11-25T10:00:01Z',
  stream: 'stderr',
  message: 'Connection refused',
}
const lines = [started, failed]

describe('filterLogs', () => {
  test('keeps every line without filters', () => {
    expect(filterLogs(lines, { query: '  ', stream: 'all' })).toEqual(lines)
  })

  test('keeps lines of one stream', () => {
    expect(filterLogs(lines, { query: '', stream: 'stderr' })).toEqual([failed])
  })

  test('finds lines by message', () => {
    expect(filterLogs(lines, { query: ' REFUSED ', stream: 'all' })).toEqual([failed])
  })

  test('finds lines by container', () => {
    expect(filterLogs(lines, { query: 'shop-app', stream: 'all' })).toEqual([started])
  })

  test('applies both filters', () => {
    expect(filterLogs(lines, { query: 'started', stream: 'stderr' })).toEqual([])
  })
})

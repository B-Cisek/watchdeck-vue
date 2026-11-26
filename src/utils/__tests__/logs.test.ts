import { describe, expect, test } from 'bun:test'
import type { LogLine } from '@/types/log'
import { filterLogs, logSourceSchema } from '@/utils/logs'

const started: LogLine = {
  id: 1,
  container: 'shop-app',
  loggedAt: '2026-11-25T10:00:00Z',
  stream: 'stdout',
  message: 'Server started',
}
const failed: LogLine = {
  id: 2,
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

describe('logSourceSchema', () => {
  test('trims the values and turns a blank host into null', () => {
    expect(logSourceSchema.parse({ containerName: ' shop-app-1 ', host: '  ' })).toEqual({
      containerName: 'shop-app-1',
      host: null,
    })
  })

  test('keeps a host', () => {
    expect(logSourceSchema.parse({ containerName: 'shop', host: 'vps-1' }).host).toBe('vps-1')
  })

  test.each(['', '-shop', 'shop app', 'shop"x'])('rejects container name %p', (containerName) => {
    expect(logSourceSchema.safeParse({ containerName, host: '' }).success).toBe(false)
  })
})

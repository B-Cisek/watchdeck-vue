import { expect, test } from 'bun:test'
import { count } from '@/utils/text'

test.each([
  [0, '0 checks'],
  [1, '1 check'],
  [2, '2 checks'],
])('counts %p', (value, expected) => {
  expect(count(value, 'check')).toBe(expected)
})

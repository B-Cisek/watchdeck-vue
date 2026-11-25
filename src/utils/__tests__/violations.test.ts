import { describe, expect, test } from 'bun:test'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { fieldErrors } from '@/utils/violations'

function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() }
  const response = { status, statusText: '', headers: {}, config, data } as AxiosResponse
  return new AxiosError('failed', undefined, config, undefined, response)
}

describe('fieldErrors', () => {
  test('maps violations to form fields', () => {
    const error = httpError(422, {
      violations: [{ propertyPath: 'groupId', title: 'Service group not found.' }],
    })

    expect(fieldErrors(error, ['name', 'groupId'])).toEqual([
      { name: 'groupId', message: 'Service group not found.' },
    ])
  })

  test('leaves out violations of fields the form does not have', () => {
    const error = httpError(422, { violations: [{ propertyPath: 'other', title: 'Wrong.' }] })

    expect(fieldErrors(error, ['name'])).toEqual([])
  })

  test.each([
    ['another status', httpError(500, { violations: [{ propertyPath: 'name', title: 'x' }] })],
    ['no violations', httpError(422, { detail: 'nope' })],
    ['an HTML body', httpError(422, '<html></html>')],
    ['a network error', new AxiosError('Network Error')],
    ['another error', new Error('x')],
  ])('is empty for %s', (_, error) => {
    expect(fieldErrors(error, ['name'])).toEqual([])
  })
})

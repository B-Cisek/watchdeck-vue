import { afterAll, afterEach, describe, expect, mock, test } from 'bun:test'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { api, setUnauthorizedHandler } from '@/utils/api'

const originalAdapter = api.defaults.adapter
const handler = mock(() => {})
setUnauthorizedHandler(handler)

function respondWith(status: number) {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const response = { status, statusText: '', headers: {}, config, data: {} }
    throw new AxiosError('failed', undefined, config, undefined, response)
  }
}

afterEach(() => {
  handler.mockClear()
})

afterAll(() => {
  api.defaults.adapter = originalAdapter
  setUnauthorizedHandler(() => {})
})

describe('unauthorized handler', () => {
  test('is called on 401 and the error is still rejected', async () => {
    respondWith(401)

    await expect(api.get('/customers')).rejects.toThrow()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  // 401 is an expected answer here: wrong password, or nobody is signed in.
  test.each([['/login'], ['/me']])('is not called on 401 from %p', async (url) => {
    respondWith(401)

    await expect(api.get(url)).rejects.toThrow()

    expect(handler).not.toHaveBeenCalled()
  })

  test.each([[403], [500]])('is not called on %p', async (status) => {
    respondWith(status)

    await expect(api.get('/customers')).rejects.toThrow()

    expect(handler).not.toHaveBeenCalled()
  })
})

import { afterAll, afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { auth as authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'

const user = { id: '01a2', email: 'a@example.com', roles: ['ROLE_USER'] }

function httpError(status: number): AxiosError {
  const config = { headers: new AxiosHeaders() }
  const response = { status, statusText: '', headers: {}, config, data: {} } as AxiosResponse
  return new AxiosError('failed', undefined, config, undefined, response)
}

const me = spyOn(authApi, 'me')
const logout = spyOn(authApi, 'logout')
const post = spyOn(api, 'post')

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  me.mockReset()
  logout.mockReset()
  post.mockReset()
})

// Test files share modules, so spies must not outlive this one.
afterAll(() => {
  me.mockRestore()
  logout.mockRestore()
  post.mockRestore()
})

describe('init', () => {
  test('sets the user', async () => {
    me.mockResolvedValue(user)
    const auth = useAuthStore()

    await auth.init()

    expect(auth.user).toEqual(user)
    expect(auth.initialized).toBe(true)
  })

  test('sends one request when called twice', async () => {
    me.mockResolvedValue(user)
    const auth = useAuthStore()

    await Promise.all([auth.init(), auth.init()])
    await auth.init()

    expect(me).toHaveBeenCalledTimes(1)
  })

  test('treats 401 as a guest', async () => {
    me.mockRejectedValue(httpError(401))
    const auth = useAuthStore()

    await auth.init()
    await auth.init()

    expect(auth.user).toBeNull()
    expect(auth.initError).toBe(false)
    expect(me).toHaveBeenCalledTimes(1)
  })

  test.each([
    ['500', httpError(500)],
    ['network error', new AxiosError('Network Error', 'ERR_NETWORK')],
  ])('reports %s and can be retried', async (_name, error) => {
    me.mockRejectedValueOnce(error).mockResolvedValueOnce(user)
    const auth = useAuthStore()

    await auth.init()
    expect(auth.initError).toBe(true)
    expect(auth.initialized).toBe(false)

    await auth.init()
    expect(auth.initError).toBe(false)
    expect(auth.user).toEqual(user)
  })
})

describe('login', () => {
  test.each([
    [true, true],
    [false, false],
    [undefined, false],
  ])('maps remember=%p to _remember_me=%p', async (remember, expected) => {
    post.mockResolvedValue({ data: user })

    await useAuthStore().login({ email: 'a@example.com', password: 'secret', remember })

    expect(post).toHaveBeenCalledWith('/login', {
      email: 'a@example.com',
      password: 'secret',
      _remember_me: expected,
    })
  })

  test('clears an earlier init error and is not overwritten by a later init', async () => {
    me.mockRejectedValue(httpError(500))
    post.mockResolvedValue({ data: user })
    const auth = useAuthStore()
    await auth.init()

    await auth.login({ email: 'a@example.com', password: 'secret' })
    await auth.init()

    expect(auth.initError).toBe(false)
    expect(auth.user).toEqual(user)
    expect(me).toHaveBeenCalledTimes(1)
  })
})

describe('logout', () => {
  test('clears the user', async () => {
    me.mockResolvedValue(user)
    logout.mockResolvedValue()
    const auth = useAuthStore()
    await auth.init()

    await auth.logout()

    expect(auth.isAuthenticated).toBe(false)
  })

  test('keeps the user when the request fails', async () => {
    me.mockResolvedValue(user)
    logout.mockRejectedValue(httpError(500))
    const auth = useAuthStore()
    await auth.init()

    await expect(auth.logout()).rejects.toThrow()

    expect(auth.isAuthenticated).toBe(true)
  })
})

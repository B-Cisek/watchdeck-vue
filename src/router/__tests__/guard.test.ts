import { describe, expect, mock, test } from 'bun:test'
import { createUnauthorizedHandler, resolveNavigation, safeRedirect } from '@/router/guard'

describe('safeRedirect', () => {
  test.each([['/'], ['/customers?x=1'], ['/settings/members#top'], ['/login-history']])(
    'keeps internal path %p',
    (path) => {
      expect(safeRedirect(path)).toBe(path)
    },
  )

  test.each([
    ['//evil.com'],
    ['/\\evil.com'],
    ['https://evil.com'],
    ['javascript:alert(1)'],
    ['customers'],
    [''],
    ['/login'],
    ['/login?redirect=/'],
    ['/login#x'],
    ['/login/'],
    [['/a']],
    [null],
    [undefined],
  ])('falls back to / for %p', (value) => {
    expect(safeRedirect(value)).toBe('/')
  })
})

describe('resolveNavigation', () => {
  const inbox = { path: '/inbox', fullPath: '/inbox?x=1', meta: {}, query: { x: '1' } }
  const home = { path: '/', fullPath: '/', meta: {}, query: {} }
  const login = {
    path: '/login',
    fullPath: '/login?redirect=/inbox',
    meta: { public: true },
    query: { redirect: '/inbox' },
  }

  test('sends a guest to login and remembers the target', () => {
    expect(resolveNavigation(inbox, false)).toEqual({
      path: '/login',
      query: { redirect: '/inbox?x=1' },
    })
  })

  test('adds no redirect for the home page', () => {
    expect(resolveNavigation(home, false)).toEqual({ path: '/login' })
  })

  test('lets a guest open a public page', () => {
    expect(resolveNavigation(login, false)).toBe(true)
  })

  test('lets a signed-in user open a private page', () => {
    expect(resolveNavigation(inbox, true)).toBe(true)
  })

  test('sends a signed-in user away from login', () => {
    expect(resolveNavigation(login, true)).toBe('/inbox')
  })

  test('lets a signed-in user open other public pages', () => {
    expect(resolveNavigation({ ...home, path: '/status', meta: { public: true } }, true)).toBe(true)
  })
})

describe('createUnauthorizedHandler', () => {
  function setup(isAuthenticated: boolean) {
    const auth = {
      isAuthenticated,
      clear: mock(() => {
        auth.isAuthenticated = false
      }),
    }
    const push = mock((_to: unknown) => Promise.resolve())
    const currentRoute = { path: '/inbox', fullPath: '/inbox?x=1', meta: {}, query: {} }
    return { auth, push, handle: createUnauthorizedHandler(auth, push, () => currentRoute) }
  }

  test('clears the session and opens login once for parallel 401s', () => {
    const { auth, push, handle } = setup(true)

    handle()
    handle()

    expect(auth.clear).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith({ path: '/login', query: { redirect: '/inbox?x=1' } })
  })

  test('does nothing for a guest', () => {
    const { push, handle } = setup(false)

    handle()

    expect(push).not.toHaveBeenCalled()
  })
})

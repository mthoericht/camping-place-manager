import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import * as authApi from '@/api/auth'

let clearDb: () => Promise<void>
let authToken: string | null = null

beforeAll(async () =>
{
  const { setupIntegrationTest } = await import('../../server/src/test/integrationEnv')
  const env = await setupIntegrationTest()
  clearDb = env.clearDb
})

beforeEach(async () =>
{
  await clearDb()
  authToken = null
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (key === 'auth_token' ? authToken : null),
    setItem: (key: string, value: string) => { if (key === 'auth_token') authToken = value },
    removeItem: () => { authToken = null },
  })
})

describe('API Integration: Auth', () =>
{
  it('signup returns 201 with token and employee', async () =>
  {
    const res = await authApi.signupApi({
      email: 'neu@test.de',
      fullName: 'Neuer User',
      password: 'geheim123',
    })
    expect(res.token).toBeTruthy()
    expect(res.employee).toMatchObject({
      email: 'neu@test.de',
      fullName: 'Neuer User',
    })
    expect(res.employee.id).toBeGreaterThan(0)
  })

  it('signup throws 409 when email already exists', async () =>
  {
    await authApi.signupApi({
      email: 'doppel@test.de',
      fullName: 'Erster',
      password: 'pass1',
    })
    await expect(authApi.signupApi({
      email: 'doppel@test.de',
      fullName: 'Zweiter',
      password: 'pass2',
    })).rejects.toMatchObject({ status: 409 })
  })

  it('login returns token and employee for valid credentials', async () =>
  {
    await authApi.signupApi({
      email: 'login@test.de',
      fullName: 'Login User',
      password: 'passwort',
    })
    const res = await authApi.loginApi({ email: 'login@test.de', password: 'passwort' })
    expect(res.token).toBeTruthy()
    expect(res.employee).toMatchObject({
      email: 'login@test.de',
      fullName: 'Login User',
    })
  })

  it('login throws 401 for wrong password', async () =>
  {
    await authApi.signupApi({
      email: 'wrong@test.de',
      fullName: 'User',
      password: 'richtig',
    })
    await expect(authApi.loginApi({
      email: 'wrong@test.de',
      password: 'falsch',
    })).rejects.toMatchObject({ status: 401 })
  })

  it('login throws 401 for unknown email', async () =>
  {
    await expect(authApi.loginApi({
      email: 'unbekannt@test.de',
      password: 'irgendwas',
    })).rejects.toMatchObject({ status: 401 })
  })

  it('getMe returns employee when valid token is in localStorage', async () =>
  {
    const signupRes = await authApi.signupApi({
      email: 'me@test.de',
      fullName: 'Me User',
      password: 'secret',
    })
    authToken = signupRes.token
    const me = await authApi.getMeApi()
    expect(me).toMatchObject({
      email: 'me@test.de',
      fullName: 'Me User',
    })
    expect(me.id).toBe(signupRes.employee.id)
  })

  it('getMe throws 401 when no token in localStorage', async () =>
  {
    await authApi.signupApi({
      email: 'nologin@test.de',
      fullName: 'User',
      password: 'x',
    })
    expect(authToken).toBeNull()
    await expect(authApi.getMeApi()).rejects.toMatchObject({ status: 401 })
  })

  it('getMe throws 401 when token is invalid', async () =>
  {
    authToken = 'invalid.jwt.token'
    await expect(authApi.getMeApi()).rejects.toMatchObject({ status: 401 })
  })
})

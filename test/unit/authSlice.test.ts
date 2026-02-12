import { describe, it, expect, beforeEach, vi } from 'vitest'
import reducer, { login, signup, fetchMe, logout, clearError } from '@/store/authSlice'
import type { Employee } from '@/api/types'

const mockEmployee: Employee = {
  id: 1,
  email: 'test@test.de',
  fullName: 'Test User',
}

describe('authSlice', () =>
{
  beforeEach(() =>
  {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('sets loading and clears error on login.pending', () =>
  {
    const state = reducer(undefined, login.pending('', { email: 'a@b.de', password: 'x' }))
    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('stores token and employee on login.fulfilled', () =>
  {
    const state = reducer(undefined, login.fulfilled(
      { token: 'jwt.here', employee: mockEmployee },
      '',
      { email: 'a@b.de', password: 'x' },
    ))
    expect(state.status).toBe('succeeded')
    expect(state.token).toBe('jwt.here')
    expect(state.employee).toEqual(mockEmployee)
  })

  it('sets failed and error message on login.rejected', () =>
  {
    const state = reducer(undefined, login.rejected(new Error('Netzwerkfehler'), '', { email: 'a@b.de', password: 'x' }))
    expect(state.status).toBe('failed')
    expect(state.error).toBe('Netzwerkfehler')
  })

  it('stores empty error message on login.rejected when Error has no message', () =>
  {
    const state = reducer(undefined, login.rejected(new Error(), '', { email: 'a@b.de', password: 'x' }))
    expect(state.status).toBe('failed')
    expect(state.error).toBe('')
  })

  it('sets loading and clears error on signup.pending', () =>
  {
    const state = reducer(undefined, signup.pending('', { email: 'a@b.de', fullName: 'A', password: 'x' }))
    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('stores token and employee on signup.fulfilled', () =>
  {
    const state = reducer(undefined, signup.fulfilled(
      { token: 'new.jwt', employee: mockEmployee },
      '',
      { email: 'a@b.de', fullName: 'A', password: 'x' },
    ))
    expect(state.status).toBe('succeeded')
    expect(state.token).toBe('new.jwt')
    expect(state.employee).toEqual(mockEmployee)
  })

  it('sets failed and error on signup.rejected', () =>
  {
    const state = reducer(undefined, signup.rejected(new Error('E-Mail vergeben'), '', { email: 'a@b.de', fullName: 'A', password: 'x' }))
    expect(state.status).toBe('failed')
    expect(state.error).toBe('E-Mail vergeben')
  })

  it('stores empty error message on signup.rejected when Error has no message', () =>
  {
    const state = reducer(undefined, signup.rejected(new Error(), '', { email: 'a@b.de', fullName: 'A', password: 'x' }))
    expect(state.status).toBe('failed')
    expect(state.error).toBe('')
  })

  it('stores employee on fetchMe.fulfilled', () =>
  {
    const withToken = reducer(undefined, login.fulfilled(
      { token: 'jwt', employee: mockEmployee },
      '',
      { email: 'a@b.de', password: 'x' },
    ))
    const state = reducer(withToken, fetchMe.fulfilled(mockEmployee, ''))
    expect(state.employee).toEqual(mockEmployee)
    expect(state.status).toBe('succeeded')
  })

  it('clears employee and token on fetchMe.rejected', () =>
  {
    const withAuth = reducer(undefined, login.fulfilled(
      { token: 'jwt', employee: mockEmployee },
      '',
      { email: 'a@b.de', password: 'x' },
    ))
    const state = reducer(withAuth, fetchMe.rejected(new Error(), ''))
    expect(state.employee).toBeNull()
    expect(state.token).toBeNull()
    expect(state.status).toBe('idle')
  })

  it('logout clears employee, token and error', () =>
  {
    const withAuth = reducer(undefined, login.fulfilled(
      { token: 'jwt', employee: mockEmployee },
      '',
      { email: 'a@b.de', password: 'x' },
    ))
    const state = reducer(withAuth, logout())
    expect(state.employee).toBeNull()
    expect(state.token).toBeNull()
    expect(state.error).toBeNull()
    expect(state.status).toBe('idle')
  })

  it('clearError sets error to null', () =>
  {
    const withError = reducer(undefined, login.rejected(new Error('Fehler'), '', { email: 'a@b.de', password: 'x' }))
    const state = reducer(withError, clearError())
    expect(state.error).toBeNull()
  })
})

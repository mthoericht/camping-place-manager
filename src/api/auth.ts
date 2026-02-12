import { api } from './client'
import type { AuthResponse, Employee } from './types'

export function loginApi(data: { email: string; password: string })
{
  return api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function signupApi(data: { email: string; fullName: string; password: string })
{
  return api<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getMeApi()
{
  return api<Employee>('/api/auth/me')
}

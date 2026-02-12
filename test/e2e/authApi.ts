import type { AuthResponse } from '@/api/types'

const E2E_EMAIL = 'e2e@test.de'
const E2E_PASSWORD = 'test1234'
const E2E_FULL_NAME = 'E2E Test'

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string>) },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getE2eAuthToken(baseUrl: string): Promise<string> {
  try {
    const data = await request<AuthResponse>(baseUrl, '/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: E2E_EMAIL, fullName: E2E_FULL_NAME, password: E2E_PASSWORD }),
    })
    return data.token
  } catch {
    const data = await request<AuthResponse>(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: E2E_EMAIL, password: E2E_PASSWORD }),
    })
    return data.token
  }
}

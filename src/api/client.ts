const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error 
{
  constructor(public status: number, message: string) 
  {
    super(message)
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> 
{
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) 
  {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, body.error ?? res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Error thrown by the API client when a request returns a non-ok response.
 * Carries the HTTP status code and the error message from the response body (or statusText).
 */
export class ApiError extends Error 
{
  /**
   * @param status - HTTP status code (e.g. 400, 404)
   * @param message - Error message from response body or statusText
   */
  constructor(public status: number, message: string) 
  {
    super(message);
  }
}

/**
 * Sends a JSON request to the API and returns the parsed response. Uses baseUrl from env
 * (empty in dev so Vite proxy can forward /api to the backend). Throws ApiError on non-ok responses.
 * @param path - Request path (e.g. '/api/bookings')
 * @param init - Optional fetch init (method, body, headers)
 * @returns Parsed JSON, or undefined for 204 No Content
 * @throws {ApiError} When res.ok is false (status and message from body or statusText)
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> 
{
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  }

  if (token)
  {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  })

  if (!res.ok) 
  {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, body.error ?? res.statusText)
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>
}

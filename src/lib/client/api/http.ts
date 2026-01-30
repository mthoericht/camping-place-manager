/**
 * Centralized HTTP utilities for client-side API calls
 */

export class HttpError extends Error 
{
  constructor(
    public status: number,
    message: string,
    public payload?: unknown
  ) 
  {
    super(message);
    this.name = 'HttpError';
  }
}

type ApiErrorPayload = { error?: string };

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> 
{
  const res = await fetch(input, init);

  if (res.ok) 
  {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  let payload: unknown = undefined;
  let message = `Request failed (${res.status})`;

  try 
  {
    payload = await res.json();
    const apiErr = payload as ApiErrorPayload;
    if (apiErr?.error) message = apiErr.error;
  } 
  catch 
  {
    try 
    {
      const text = await res.text();
      if (text) message = text;
    } 
    catch 
    {
      // ignore
    }
  }

  throw new HttpError(res.status, message, payload);
}

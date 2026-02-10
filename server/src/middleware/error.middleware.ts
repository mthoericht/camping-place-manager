import type { Request, Response, NextFunction } from 'express'

export class HttpError extends Error 
{
  constructor(public statusCode: number, message: string) 
  {
    super(message)
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) 
{
  const statusCode = err instanceof HttpError ? err.statusCode : 500
  const message = err.message || 'Internal Server Error'
  res.status(statusCode).json({ error: message })
}

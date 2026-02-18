import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error 
{
  constructor(public statusCode: number, message: string) 
  {
    super(message);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) 
{
  if (err instanceof HttpError) 
  {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  const message = process.env.NODE_ENV === 'production' ? 'Interner Serverfehler.' : (err.message || 'Internal Server Error');
  res.status(500).json({ error: message });
}

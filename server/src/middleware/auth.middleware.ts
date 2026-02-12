import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/auth.service'
import { HttpError } from './error.middleware'

/**
 * Express request type with optional employee id set by requireAuth after JWT verification.
 */
export interface AuthRequest extends Request
{
  employeeId?: number
}

/**
 * Middleware that requires a valid JWT in the Authorization header (Bearer token).
 * On success sets req.employeeId from the token payload and calls next; otherwise calls next with an error (401 or from token verification).
 */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction)
{
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
  {
    return next(new HttpError(401, 'Authentifizierung erforderlich.'))
  }

  try
  {
    const payload = verifyToken(header.slice(7))
    req.employeeId = payload.id
    next()
  }
  catch (err)
  {
    next(err)
  }
}

import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware'
import * as service from '../services/auth.service'

export async function signupHandler(req: AuthRequest, res: Response, next: NextFunction)
{
  try
  {
    const result = await service.signup(req.body)
    res.status(201).json(result)
  }
  catch (err) { next(err) }
}

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction)
{
  try
  {
    const result = await service.login(req.body)
    res.json(result)
  }
  catch (err) { next(err) }
}

export async function meHandler(req: AuthRequest, res: Response, next: NextFunction)
{
  try
  {
    const employee = await service.getMe(req.employeeId!)
    res.json(employee)
  }
  catch (err) { next(err) }
}

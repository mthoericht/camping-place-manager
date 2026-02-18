import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as service from '../services/auth.service';
import { validate } from '../middleware/validate';

export async function signupHandler(req: AuthRequest, res: Response, next: NextFunction)
{
  try
  {
    validate(req.body, [
      { field: 'email', required: true, type: 'string' },
      { field: 'fullName', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' },
    ]);
    const result = await service.signup(req.body);
    res.status(201).json(result);
  }
  catch (err) { next(err); }
}

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction)
{
  try
  {
    validate(req.body, [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' },
    ]);
    const result = await service.login(req.body);
    res.json(result);
  }
  catch (err) { next(err); }
}

export async function meHandler(req: AuthRequest, res: Response, next: NextFunction)
{
  try
  {
    const employee = await service.getMe(req.employeeId!);
    res.json(employee);
  }
  catch (err) { next(err); }
}

import type { Request, Response, NextFunction } from 'express'
import * as service from '../services/analytics.service'

export async function getAnalytics(_req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const analytics = await service.getAnalytics()
    res.json(analytics)
  }
  catch (err) { next(err) }
}

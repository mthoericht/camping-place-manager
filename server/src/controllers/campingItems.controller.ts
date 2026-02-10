import type { Request, Response, NextFunction } from 'express'
import * as service from '../services/campingItems.service'
import { HttpError } from '../middleware/error.middleware'

export async function getAll(_req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const items = await service.getAllCampingItems()
    res.json(items)
  }
  catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.getCampingItemById(Number(req.params.id))
    if (!item) throw new HttpError(404, 'Camping item not found')
    res.json(item)
  }
  catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.createCampingItem(req.body)
    res.status(201).json(item)
  }
  catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.updateCampingItem(Number(req.params.id), req.body)
    res.json(item)
  }
  catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    await service.deleteCampingItem(Number(req.params.id))
    res.status(204).end()
  }
  catch (err) { next(err) }
}

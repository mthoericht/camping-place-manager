import type { Request, Response, NextFunction } from 'express';
import * as service from '../services/campingItems.service';
import { HttpError } from '../middleware/error.middleware';
import { broadcast } from '../ws/broadcast';

export async function getAll(_req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const items = await service.getAllCampingItems();
    res.json(items);
  }
  catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.getCampingItemById(Number(req.params.id));
    if (!item) throw new HttpError(404, 'Camping item not found');
    res.json(item);
  }
  catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.createCampingItem(req.body);
    broadcast({ type: 'campingItems/created', payload: item });
    res.status(201).json(item);
  }
  catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.updateCampingItem(Number(req.params.id), req.body);
    broadcast({ type: 'campingItems/updated', payload: item });
    res.json(item);
  }
  catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const id = Number(req.params.id);
    await service.deleteCampingItem(id);
    broadcast({ type: 'campingItems/deleted', payload: { id } });
    res.status(204).end();
  }
  catch (err) { next(err); }
}

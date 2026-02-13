import type { Request, Response, NextFunction } from 'express'
import * as service from '../services/campingPlaces.service'
import { HttpError } from '../middleware/error.middleware'
import { broadcast } from '../ws/broadcast'

export async function getAll(_req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const places = await service.getAllCampingPlaces()
    res.json(places)
  }
  catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const place = await service.getCampingPlaceById(Number(req.params.id))
    if (!place) throw new HttpError(404, 'Camping place not found')
    res.json(place)
  }
  catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const place = await service.createCampingPlace(req.body)
    broadcast({ type: 'campingPlaces/created', payload: place })
    res.status(201).json(place)
  }
  catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const place = await service.updateCampingPlace(Number(req.params.id), req.body)
    broadcast({ type: 'campingPlaces/updated', payload: place })
    res.json(place)
  }
  catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const id = Number(req.params.id)
    await service.deleteCampingPlace(id)
    broadcast({ type: 'campingPlaces/deleted', payload: { id } })
    res.status(204).end()
  }
  catch (err) { next(err) }
}

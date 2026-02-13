import type { Request, Response, NextFunction } from 'express'
import * as service from '../services/bookings.service'
import { HttpError } from '../middleware/error.middleware'
import { broadcast } from '../ws/broadcast'

export async function getAll(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const bookings = await service.getAllBookings(req.query as Record<string, string>)
    res.json(bookings)
  }
  catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const booking = await service.getBookingById(Number(req.params.id))
    if (!booking) throw new HttpError(404, 'Booking not found')
    res.json(booking)
  }
  catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const booking = await service.createBooking(req.body)
    broadcast({ type: 'bookings/created', payload: booking })
    res.status(201).json(booking)
  }
  catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const booking = await service.updateBooking(Number(req.params.id), req.body)
    broadcast({ type: 'bookings/updated', payload: booking })
    res.json(booking)
  }
  catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const id = Number(req.params.id)
    await service.deleteBooking(id)
    broadcast({ type: 'bookings/deleted', payload: { id } })
    res.status(204).end()
  }
  catch (err) { next(err) }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const { status } = req.body
    if (!status) throw new HttpError(400, 'Status is required')
    const booking = await service.changeBookingStatus(Number(req.params.id), status)
    broadcast({ type: 'bookings/updated', payload: booking })
    res.json(booking)
  }
  catch (err) { next(err) }
}

export async function getStatusChanges(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const changes = await service.getBookingStatusChanges(Number(req.params.id))
    res.json(changes)
  }
  catch (err) { next(err) }
}

export async function getBookingItems(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const items = await service.getBookingItems(Number(req.params.id))
    res.json(items)
  }
  catch (err) { next(err) }
}

export async function addBookingItem(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    const item = await service.addBookingItem(Number(req.params.id), req.body)
    res.status(201).json(item)
  }
  catch (err) { next(err) }
}

export async function removeBookingItem(req: Request, res: Response, next: NextFunction) 
{
  try 
  {
    await service.removeBookingItem(Number(req.params.itemId))
    res.status(204).end()
  }
  catch (err) { next(err) }
}

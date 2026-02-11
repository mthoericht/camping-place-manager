import prisma from '../prisma/client'
import { HttpError } from '../middleware/error.middleware'

export async function getAllCampingPlaces() 
{
  return prisma.campingPlace.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getCampingPlaceById(id: number) 
{
  return prisma.campingPlace.findUnique({ where: { id } })
}

export async function createCampingPlace(data: {
  name: string; description?: string; location: string
  size: number; price: number; amenities?: string; isActive?: boolean
}) 
{
  return prisma.campingPlace.create({
    data: {
      name: data.name, description: data.description, location: data.location,
      size: data.size, price: data.price,
      amenities: data.amenities ?? '', isActive: data.isActive ?? true,
    },
  })
}

export async function updateCampingPlace(id: number, data: Record<string, unknown>) 
{
  const place = await prisma.campingPlace.findUnique({ where: { id } })
  if (!place) throw new HttpError(404, 'Camping place not found')
  return prisma.campingPlace.update({ where: { id }, data })
}

export async function deleteCampingPlace(id: number) 
{
  const activeBookings = await prisma.booking.count({
    where: { campingPlaceId: id, status: { in: ['PENDING', 'CONFIRMED', 'PAID'] } },
  })
  if (activeBookings > 0) 
  {
    throw new HttpError(400, 'Stellplatz kann nicht gelöscht werden, solange aktive Buchungen existieren.')
  }
  return prisma.campingPlace.delete({ where: { id } })
}

import prisma from '../prisma/client'
import { HttpError } from '../middleware/error.middleware'

export async function getAllCampingItems() 
{
  return prisma.campingItem.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getCampingItemById(id: number) 
{
  return prisma.campingItem.findUnique({ where: { id } })
}

export async function createCampingItem(data: {
  name: string; category: string; size: number; description?: string; isActive?: boolean
}) 
{
  return prisma.campingItem.create({
    data: {
      name: data.name, category: data.category, size: data.size,
      description: data.description, isActive: data.isActive ?? true,
    },
  })
}

export async function updateCampingItem(id: number, data: Record<string, unknown>) 
{
  const item = await prisma.campingItem.findUnique({ where: { id } })
  if (!item) throw new HttpError(404, 'Camping item not found')
  return prisma.campingItem.update({ where: { id }, data })
}

export async function deleteCampingItem(id: number) 
{
  const activeItems = await prisma.bookingItem.count({
    where: { campingItemId: id, booking: { status: { in: ['PENDING', 'CONFIRMED', 'PAID'] } } },
  })
  if (activeItems > 0) 
  {
    throw new HttpError(400, 'Camping-Item kann nicht gelöscht werden, solange aktive Buchungen existieren.')
  }
  return prisma.campingItem.delete({ where: { id } })
}

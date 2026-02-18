import prisma from '../prisma/client';
import { HttpError } from '../middleware/error.middleware';
import { calcBookingTotalPrice } from '../../../shared/bookingPrice';

const bookingInclude = {
  campingPlace: true,
  bookingItems: { include: { campingItem: true } },
  statusChanges: { orderBy: { changedAt: 'asc' as const }, include: { employee: { select: { id: true, fullName: true } } } },
};

export async function getAllBookings(filters: Record<string, string>) 
{
  const where: Record<string, unknown> = {};
  if (filters.campingPlaceId) where.campingPlaceId = Number(filters.campingPlaceId);
  if (filters.status) where.status = filters.status;

  return prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookingById(id: number) 
{
  return prisma.booking.findUnique({ where: { id }, include: bookingInclude });
}

export async function createBooking(data: {
  campingPlaceId: number; customerName: string; customerEmail: string
  customerPhone?: string; startDate?: string; endDate?: string
  guests: number; totalPrice: number; status?: string; notes?: string
  bookingItems?: Array<{ campingItemId: number; quantity: number }>
}, employeeId?: number)
{
  const place = await prisma.campingPlace.findUnique({ where: { id: data.campingPlaceId } });
  if (!place) throw new HttpError(400, 'Stellplatz existiert nicht.');

  if (data.bookingItems?.length) 
  {
    for (const bi of data.bookingItems) 
    {
      const item = await prisma.campingItem.findUnique({ where: { id: bi.campingItemId } });
      if (!item) throw new HttpError(400, `Camping-Item mit ID ${bi.campingItemId} existiert nicht.`);
    }
  }

  const start = data.startDate ? new Date(data.startDate) : null;
  const end = data.endDate ? new Date(data.endDate) : null;
  const totalPrice = calcBookingTotalPrice(start, end, place.price);

  return prisma.$transaction(async (tx) => 
  {
    const booking = await tx.booking.create({
      data: {
        campingPlaceId: data.campingPlaceId, customerName: data.customerName,
        customerEmail: data.customerEmail, customerPhone: data.customerPhone,
        startDate: start, endDate: end,
        guests: data.guests, totalPrice,
        status: data.status ?? 'PENDING', notes: data.notes,
      },
    });

    if (data.bookingItems?.length) 
    {
      for (const item of data.bookingItems) 
      {
        await tx.bookingItem.create({
          data: { bookingId: booking.id, campingItemId: item.campingItemId, quantity: item.quantity },
        });
      }
    }

    await tx.bookingStatusChange.create({
      data: { bookingId: booking.id, status: booking.status, changedAt: new Date(), employeeId: employeeId ?? undefined },
    });

    return tx.booking.findUnique({ where: { id: booking.id }, include: bookingInclude });
  });
}

export async function updateBooking(id: number, data: Record<string, unknown>)
{
  const bookingItems = data.bookingItems as Array<{ campingItemId: number; quantity: number }> | undefined;
  const updateData: Record<string, unknown> = { ...data };
  if (typeof updateData.startDate === 'string') updateData.startDate = new Date(updateData.startDate as string);
  if (typeof updateData.endDate === 'string') updateData.endDate = new Date(updateData.endDate as string);
  delete updateData.campingPlace;
  delete updateData.bookingItems;
  delete updateData.statusChanges;
  delete updateData.id;

  if (bookingItems?.length)
  {
    for (const bi of bookingItems)
    {
      const item = await prisma.campingItem.findUnique({ where: { id: bi.campingItemId } });
      if (!item) throw new HttpError(400, `Camping-Item mit ID ${bi.campingItemId} existiert nicht.`);
    }
  }

  return prisma.$transaction(async (tx) =>
  {
    const current = await tx.booking.findUnique({ where: { id }, include: { campingPlace: true } });
    if (!current) throw new HttpError(404, 'Booking not found');
    const start = (updateData.startDate instanceof Date ? updateData.startDate : current.startDate) as Date | null;
    const end = (updateData.endDate instanceof Date ? updateData.endDate : current.endDate) as Date | null;
    const placeId = (updateData.campingPlaceId as number) ?? current.campingPlaceId;
    const place = placeId === current.campingPlaceId ? current.campingPlace : await tx.campingPlace.findUnique({ where: { id: placeId } });
    const totalPrice = calcBookingTotalPrice(start, end, place?.price ?? 0);
    updateData.totalPrice = totalPrice;

    await tx.booking.update({
      where: { id },
      data: updateData as { campingPlaceId?: number; customerName?: string; customerEmail?: string; customerPhone?: string | null; startDate?: Date | null; endDate?: Date | null; guests?: number; totalPrice: number; status?: string; notes?: string | null },
    });
    if (Array.isArray(bookingItems))
    {
      await tx.bookingItem.deleteMany({ where: { bookingId: id } });
      for (const bi of bookingItems)
      {
        await tx.bookingItem.create({
          data: { bookingId: id, campingItemId: bi.campingItemId, quantity: bi.quantity },
        });
      }
    }
    return tx.booking.findUnique({ where: { id }, include: bookingInclude });
  });
}

export async function deleteBooking(id: number) 
{
  return prisma.$transaction(async (tx) => 
  {
    await tx.bookingItem.deleteMany({ where: { bookingId: id } });
    await tx.bookingStatusChange.deleteMany({ where: { bookingId: id } });
    return tx.booking.delete({ where: { id } });
  });
}

export async function changeBookingStatus(id: number, status: string, employeeId?: number)
{
  return prisma.$transaction(async (tx) =>
  {
    const booking = await tx.booking.update({
      where: { id }, data: { status }, include: bookingInclude,
    });
    await tx.bookingStatusChange.create({
      data: { bookingId: id, status, changedAt: new Date(), employeeId: employeeId ?? undefined },
    });
    return booking;
  });
}

export async function getBookingStatusChanges(bookingId: number)
{
  return prisma.bookingStatusChange.findMany({
    where: { bookingId },
    orderBy: { changedAt: 'asc' },
    include: { employee: { select: { id: true, fullName: true } } },
  });
}

export async function getBookingItems(bookingId: number) 
{
  return prisma.bookingItem.findMany({
    where: { bookingId }, include: { campingItem: true },
  });
}

export async function addBookingItem(bookingId: number, data: { campingItemId: number; quantity: number }) 
{
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new HttpError(404, 'Booking not found');
  const item = await prisma.campingItem.findUnique({ where: { id: data.campingItemId } });
  if (!item) throw new HttpError(400, `Camping-Item mit ID ${data.campingItemId} existiert nicht.`);
  return prisma.bookingItem.create({
    data: { bookingId, campingItemId: data.campingItemId, quantity: data.quantity },
    include: { campingItem: true },
  });
}

export async function removeBookingItem(id: number) 
{
  return prisma.bookingItem.delete({ where: { id } });
}

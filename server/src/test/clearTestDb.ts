import prisma from '../prisma/client';

export async function clearTestDb(): Promise<void>
{
  await prisma.bookingItem.deleteMany();
  await prisma.bookingStatusChange.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.campingPlace.deleteMany();
  await prisma.campingItem.deleteMany();
  await prisma.employee.deleteMany();
}

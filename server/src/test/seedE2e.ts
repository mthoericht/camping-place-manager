import bcrypt from 'bcryptjs'
import prisma from '../prisma/client'

const E2E_EMAIL = 'e2e@test.de'
const E2E_PASSWORD = 'test1234'
const E2E_FULL_NAME = 'E2E Test'

export async function seedE2e(): Promise<void>
{
  await prisma.bookingItem.deleteMany()
  await prisma.bookingStatusChange.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.campingPlace.deleteMany()
  await prisma.campingItem.deleteMany()
  await prisma.employee.deleteMany()

  const hashedPassword = await bcrypt.hash(E2E_PASSWORD, 12)
  await prisma.employee.create({
    data: { email: E2E_EMAIL, fullName: E2E_FULL_NAME, password: hashedPassword },
  })
}

seedE2e()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })

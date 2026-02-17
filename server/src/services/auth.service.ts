import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { HttpError } from '../middleware/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || (() =>
{
  if (process.env.NODE_ENV === 'production')
    throw new Error('JWT_SECRET muss in Produktion gesetzt sein.');
  return 'camping-place-manager-secret-key';
})();
const JWT_EXPIRES_IN = '7d';

const E2E_TEST_EMAIL = 'e2e@test.de';

function rejectTestCredentialsInProduction(email: string): void
{
  if (process.env.NODE_ENV === 'production' && email === E2E_TEST_EMAIL)
    throw new HttpError(401, 'Ungültige E-Mail oder Passwort.');
}

export async function signup(data: { email: string; fullName: string; password: string })
{
  rejectTestCredentialsInProduction(data.email);
  const existing = await prisma.employee.findUnique({ where: { email: data.email } });
  if (existing) throw new HttpError(409, 'E-Mail wird bereits verwendet.');

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const employee = await prisma.employee.create({
    data: { email: data.email, fullName: data.fullName, password: hashedPassword },
  });

  const token = jwt.sign({ id: employee.id, email: employee.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, employee: { id: employee.id, email: employee.email, fullName: employee.fullName } };
}

export async function login(data: { email: string; password: string })
{
  rejectTestCredentialsInProduction(data.email);
  const employee = await prisma.employee.findUnique({ where: { email: data.email } });
  if (!employee) throw new HttpError(401, 'Ungültige E-Mail oder Passwort.');

  const valid = await bcrypt.compare(data.password, employee.password);
  if (!valid) throw new HttpError(401, 'Ungültige E-Mail oder Passwort.');

  const token = jwt.sign({ id: employee.id, email: employee.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, employee: { id: employee.id, email: employee.email, fullName: employee.fullName } };
}

export async function getMe(employeeId: number)
{
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new HttpError(404, 'Mitarbeiter nicht gefunden.');
  return { id: employee.id, email: employee.email, fullName: employee.fullName };
}

export function verifyToken(token: string): { id: number; email: string }
{
  try
  {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  }
  catch
  {
    throw new HttpError(401, 'Ungültiges oder abgelaufenes Token.');
  }
}

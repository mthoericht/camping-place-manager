import 'server-only';
import { PrismaClient } from '@prisma/client';
import { validateEnv } from './env';

// Validate environment variables on module load
if (typeof window === 'undefined') 
{
  try 
  {
    validateEnv();
  }
  catch (error) 
  {
    console.error('Environment validation failed:', error);
    // In development, we might want to continue, but log the error
    if (process.env.NODE_ENV === 'production') 
    {
      throw error;
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') 
{
  globalForPrisma.prisma = prisma;
}

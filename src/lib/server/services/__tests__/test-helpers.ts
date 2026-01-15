import { prisma } from '@/lib/server/prisma';
import { MongoDbHelper } from '@/lib/server/MongoDbHelper';

/**
 * Test helper utilities for service tests
 * Provides common mock patterns for Prisma operations and MongoDbHelper
 */

/**
 * Mock Prisma count result
 */
export function mockPrismaCount(count: number) 
{
  return { n: count };
}

/**
 * Mock Prisma find result with cursor
 */
export function mockPrismaFindResult(items: any[]) 
{
  return {
    cursor: {
      firstBatch: items,
    },
  };
}

/**
 * Mock Prisma aggregate result with cursor
 */
export function mockPrismaAggregateResult(items: any[]) 
{
  return {
    cursor: {
      firstBatch: items,
    },
  };
}

/**
 * Mock empty Prisma result
 */
export function mockPrismaEmptyResult() 
{
  return {
    cursor: {
      firstBatch: [],
    },
  };
}

/**
 * Setup multiple Prisma mocks in sequence
 */
export function setupPrismaMocks(mocks: any[]) 
{
  mocks.forEach((mock) => 
  {
    (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce(mock);
  });
}

/**
 * Mock Prisma error
 */
export function mockPrismaError(error: Error) 
{
  (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(error);
}

/**
 * Setup standard MongoDbHelper mocks
 * This sets up the most common mock implementations used across tests
 */
export function setupMongoDbHelperMocks() 
{
  (MongoDbHelper.extractObjectId as jest.Mock).mockImplementation((id: any) => 
  {
    if (id?.$oid) return id.$oid;
    return String(id);
  });

  (MongoDbHelper.parseMongoDate as jest.Mock).mockImplementation((date: any) => 
  {
    if (date?.$date) return date.$date;
    return date;
  });

  (MongoDbHelper.toObjectId as jest.Mock).mockImplementation((id: string) => ({
    $oid: id,
  }));
}

/**
 * Mock MongoDbHelper.extractCampingPlaceId
 */
export function mockExtractCampingPlaceId(id: string) 
{
  (MongoDbHelper.extractCampingPlaceId as jest.Mock).mockReturnValue(id);
}

/**
 * Setup console.error spy and return cleanup function
 * Usage: const cleanup = setupConsoleErrorSpy();
 *        // ... test code ...
 *        cleanup();
 */
export function setupConsoleErrorSpy() 
{
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return () => 
  {
    consoleSpy.mockRestore();
  };
}

/**
 * Mock fetch for API tests
 */
export function mockFetchSuccess(data: any) 
{
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

/**
 * Mock fetch failure for API tests
 */
export function mockFetchFailure() 
{
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
  });
}

/**
 * Mock fetch error for API tests
 */
export function mockFetchError(error: Error) 
{
  global.fetch = jest.fn().mockRejectedValueOnce(error);
}


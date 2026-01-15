import { CampingItemService } from '../CampingItemService';
import { prisma } from '@/lib/server/prisma';
import { MongoDbHelper } from '@/lib/server/MongoDbHelper';
import {
  mockPrismaFindResult,
  mockPrismaEmptyResult,
  mockPrismaError,
  setupMongoDbHelperMocks,
  setupConsoleErrorSpy,
} from './helpers';

// Mock dependencies
jest.mock('@/lib/server/prisma', () => ({
  prisma: {
    $runCommandRaw: jest.fn(),
  },
}));

jest.mock('@/lib/server/MongoDbHelper');

describe('CampingItemService', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('getCampingItems', () => 
  {
    it('should return empty array when no camping items exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce(mockPrismaEmptyResult());

      const result = await CampingItemService.getCampingItems();
      expect(result).toEqual([]);
    });

    it('should return mapped camping items', async () => 
    {
      const mockCampingItem = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        name: 'Tent',
        category: 'Shelter',
        size: 10,
        description: 'A nice tent',
        isActive: true,
        createdAt: { $date: '2024-01-01T00:00:00.000Z' },
        updatedAt: { $date: '2024-01-01T00:00:00.000Z' },
      };

      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce(
        mockPrismaFindResult([mockCampingItem])
      );

      setupMongoDbHelperMocks();

      const result = await CampingItemService.getCampingItems();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tent');
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle errors gracefully and return empty array', async () => 
    {
      mockPrismaError(new Error('Database error'));

      const cleanup = setupConsoleErrorSpy();
      const result = await CampingItemService.getCampingItems();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
      cleanup();
    });
  });

  describe('getCampingItem', () => 
  {
    it('should return null when camping item does not exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce(mockPrismaEmptyResult());

      const result = await CampingItemService.getCampingItem('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });

    it('should return camping item by ID', async () => 
    {
      const mockCampingItem = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        name: 'Tent',
        category: 'Shelter',
        size: 10,
        description: 'A nice tent',
        isActive: true,
        createdAt: { $date: '2024-01-01T00:00:00.000Z' },
        updatedAt: { $date: '2024-01-01T00:00:00.000Z' },
      };

      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce(
        mockPrismaFindResult([mockCampingItem])
      );

      setupMongoDbHelperMocks();

      const result = await CampingItemService.getCampingItem('507f1f77bcf86cd799439011');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Tent');
      expect(result?.category).toBe('Shelter');
    });

    it('should handle errors gracefully and return null', async () => 
    {
      mockPrismaError(new Error('Database error'));

      const cleanup = setupConsoleErrorSpy();
      const result = await CampingItemService.getCampingItem('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      cleanup();
    });
  });
});


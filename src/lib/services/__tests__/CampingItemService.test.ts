import { CampingItemService } from '../CampingItemService';
import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $runCommandRaw: jest.fn(),
  },
}));

jest.mock('@/lib/MongoDbHelper');

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
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });

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

      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [mockCampingItem] },
      });

      (MongoDbHelper.extractObjectId as jest.Mock).mockImplementation((id) => 
      {
        if (id?.$oid) return id.$oid;
        return String(id);
      });

      (MongoDbHelper.parseMongoDate as jest.Mock).mockImplementation((date) => 
      {
        if (date?.$date) return date.$date;
        return date;
      });

      const result = await CampingItemService.getCampingItems();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tent');
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle errors gracefully and return empty array', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await CampingItemService.getCampingItems();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getCampingItem', () => 
  {
    it('should return null when camping item does not exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });

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

      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [mockCampingItem] },
      });

      (MongoDbHelper.extractObjectId as jest.Mock).mockImplementation((id) => 
      {
        if (id?.$oid) return id.$oid;
        return String(id);
      });

      (MongoDbHelper.parseMongoDate as jest.Mock).mockImplementation((date) => 
      {
        if (date?.$date) return date.$date;
        return date;
      });

      (MongoDbHelper.toObjectId as jest.Mock).mockImplementation((id) => ({
        $oid: id,
      }));

      const result = await CampingItemService.getCampingItem('507f1f77bcf86cd799439011');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Tent');
      expect(result?.category).toBe('Shelter');
    });

    it('should handle errors gracefully and return null', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await CampingItemService.getCampingItem('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});


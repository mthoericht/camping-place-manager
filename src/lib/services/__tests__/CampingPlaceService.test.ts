import { CampingPlaceService } from '../CampingPlaceService';
import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $runCommandRaw: jest.fn(),
  },
}));

jest.mock('@/lib/MongoDbHelper');

describe('CampingPlaceService', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('getCampingPlaces', () => 
  {
    it('should return empty array when no camping places exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });

      const result = await CampingPlaceService.getCampingPlaces();
      expect(result).toEqual([]);
    });

    it('should return mapped camping places', async () => 
    {
      const mockCampingPlace = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        name: 'Test Place',
        description: 'Test Description',
        location: 'Test Location',
        size: 100,
        price: 50,
        amenities: ['WiFi', 'Power'],
        isActive: true,
        createdAt: { $date: '2024-01-01T00:00:00.000Z' },
        updatedAt: { $date: '2024-01-01T00:00:00.000Z' },
      };

      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [mockCampingPlace] },
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

      const result = await CampingPlaceService.getCampingPlaces();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Place');
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle errors gracefully and return empty array', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await CampingPlaceService.getCampingPlaces();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getCampingPlace', () => 
  {
    it('should return null when camping place does not exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });

      const result = await CampingPlaceService.getCampingPlace('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });

    it('should return camping place with bookings', async () => 
    {
      const mockCampingPlace = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        name: 'Test Place',
        description: 'Test Description',
        location: 'Test Location',
        size: 100,
        price: 50,
        amenities: ['WiFi'],
        isActive: true,
        createdAt: { $date: '2024-01-01T00:00:00.000Z' },
        updatedAt: { $date: '2024-01-01T00:00:00.000Z' },
      };

      const mockBooking = {
        _id: { $oid: '507f1f77bcf86cd799439012' },
        customerName: 'John Doe',
      };

      (prisma.$runCommandRaw as jest.Mock)
        .mockResolvedValueOnce({
          cursor: { firstBatch: [mockCampingPlace] },
        })
        .mockResolvedValueOnce({
          cursor: { firstBatch: [mockBooking] },
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

      const result = await CampingPlaceService.getCampingPlace('507f1f77bcf86cd799439011');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test Place');
      expect(result?.bookings).toHaveLength(1);
    });

    it('should handle errors gracefully and return null', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await CampingPlaceService.getCampingPlace('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});


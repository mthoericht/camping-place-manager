import { BookingService } from '../BookingService';
import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $runCommandRaw: jest.fn(),
  },
}));

jest.mock('@/lib/MongoDbHelper');

describe('BookingService', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('getBookings', () => 
  {
    it('should return empty array when no bookings exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });

      const result = await BookingService.getBookings();
      expect(result).toEqual([]);
    });

    it('should return mapped bookings with camping place information', async () => 
    {
      const mockBooking = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        campingPlaceId: { $oid: '507f1f77bcf86cd799439012' },
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        startDate: { $date: '2024-01-15T00:00:00.000Z' },
        endDate: { $date: '2024-01-20T00:00:00.000Z' },
        guests: 2,
        totalPrice: 500,
        status: 'CONFIRMED',
        notes: 'Test booking',
        createdAt: { $date: '2024-01-10T00:00:00.000Z' },
        updatedAt: { $date: '2024-01-10T00:00:00.000Z' },
      };

      const mockCampingPlace = {
        _id: { $oid: '507f1f77bcf86cd799439012' },
        name: 'Test Place',
        location: 'Test Location',
      };

      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [mockBooking] },
      });
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [mockCampingPlace] },
      });

      (MongoDbHelper.extractObjectId as jest.Mock).mockImplementation((id) => 
      {
        if (id?.$oid) return id.$oid;
        return String(id);
      });

      (MongoDbHelper.extractCampingPlaceId as jest.Mock).mockReturnValue('507f1f77bcf86cd799439012');
      (MongoDbHelper.parseMongoDate as jest.Mock).mockImplementation((date) => 
      {
        if (date?.$date) return date.$date;
        return date;
      });

      const result = await BookingService.getBookings();

      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('John Doe');
      expect(result[0].campingPlace?.name).toBe('Test Place');
    });

    it('should handle errors gracefully and return empty array', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await BookingService.getBookings();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getBooking', () => 
  {
    it('should return null when booking does not exist', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockResolvedValueOnce({
        cursor: { firstBatch: [] },
      });

      const result = await BookingService.getBooking('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });

    it('should return booking with all related data', async () => 
    {
      const mockBooking = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        campingPlaceId: { $oid: '507f1f77bcf86cd799439012' },
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startDate: { $date: '2024-01-15T00:00:00.000Z' },
        endDate: { $date: '2024-01-20T00:00:00.000Z' },
        guests: 2,
        totalPrice: 500,
        status: 'CONFIRMED',
        createdAt: { $date: '2024-01-10T00:00:00.000Z' },
        updatedAt: { $date: '2024-01-10T00:00:00.000Z' },
      };

      const mockCampingPlace = {
        _id: { $oid: '507f1f77bcf86cd799439012' },
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

      (prisma.$runCommandRaw as jest.Mock)
        .mockResolvedValueOnce({
          cursor: { firstBatch: [mockBooking] },
        })
        .mockResolvedValueOnce({
          cursor: { firstBatch: [mockCampingPlace] },
        })
        .mockResolvedValueOnce({
          cursor: { firstBatch: [] },
        });

      (MongoDbHelper.extractObjectId as jest.Mock).mockImplementation((id) => 
      {
        if (id?.$oid) return id.$oid;
        return String(id);
      });

      (MongoDbHelper.extractCampingPlaceId as jest.Mock).mockReturnValue('507f1f77bcf86cd799439012');
      (MongoDbHelper.parseMongoDate as jest.Mock).mockImplementation((date) => 
      {
        if (date?.$date) return date.$date;
        return date;
      });
      (MongoDbHelper.toObjectId as jest.Mock).mockImplementation((id) => ({
        $oid: id,
      }));

      const result = await BookingService.getBooking('507f1f77bcf86cd799439011');

      expect(result).not.toBeNull();
      expect(result?.customerName).toBe('John Doe');
      expect(result?.campingPlace.name).toBe('Test Place');
    });

    it('should handle errors gracefully and return null', async () => 
    {
      (prisma.$runCommandRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await BookingService.getBooking('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getBookingFromAPI', () => 
  {
    it('should fetch booking from API endpoint', async () => 
    {
      const mockBooking = {
        id: '507f1f77bcf86cd799439011',
        customerName: 'John Doe',
        campingPlace: {
          id: '507f1f77bcf86cd799439012',
          name: 'Test Place',
        },
        bookingItems: [],
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      });

      const result = await BookingService.getBookingFromAPI('507f1f77bcf86cd799439011');

      expect(result).not.toBeNull();
      expect(result?.customerName).toBe('John Doe');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bookings/507f1f77bcf86cd799439011'),
        { cache: 'no-store' }
      );
    });

    it('should return null when API request fails', async () => 
    {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
      });

      const result = await BookingService.getBookingFromAPI('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => 
    {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await BookingService.getBookingFromAPI('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});


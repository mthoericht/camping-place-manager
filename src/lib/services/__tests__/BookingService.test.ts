import { BookingService } from '../BookingService';
import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';
import {
  mockPrismaFindResult,
  mockPrismaEmptyResult,
  setupPrismaMocks,
  mockPrismaError,
  setupMongoDbHelperMocks,
  mockExtractCampingPlaceId,
  setupConsoleErrorSpy,
} from './helpers';

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
      setupPrismaMocks([
        mockPrismaEmptyResult(),
        mockPrismaEmptyResult(),
      ]);

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

      setupPrismaMocks([
        mockPrismaFindResult([mockBooking]),
        mockPrismaFindResult([mockCampingPlace]),
      ]);

      setupMongoDbHelperMocks();
      mockExtractCampingPlaceId('507f1f77bcf86cd799439012');

      const result = await BookingService.getBookings();

      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('John Doe');
      expect(result[0].campingPlace?.name).toBe('Test Place');
    });

    it('should handle errors gracefully and return empty array', async () => 
    {
      mockPrismaError(new Error('Database error'));

      const cleanup = setupConsoleErrorSpy();
      const result = await BookingService.getBookings();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
      cleanup();
    });
  });

  describe('getBooking', () => 
  {
    it('should return null when booking does not exist', async () => 
    {
      setupPrismaMocks([
        mockPrismaEmptyResult(),
      ]);

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

      setupPrismaMocks([
        mockPrismaFindResult([mockBooking]),
        mockPrismaFindResult([mockCampingPlace]),
        mockPrismaEmptyResult(),
      ]);

      setupMongoDbHelperMocks();
      mockExtractCampingPlaceId('507f1f77bcf86cd799439012');

      const result = await BookingService.getBooking('507f1f77bcf86cd799439011');

      expect(result).not.toBeNull();
      expect(result?.customerName).toBe('John Doe');
      expect(result?.campingPlace.name).toBe('Test Place');
    });

    it('should handle errors gracefully and return null', async () => 
    {
      mockPrismaError(new Error('Database error'));

      const cleanup = setupConsoleErrorSpy();
      const result = await BookingService.getBooking('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      cleanup();
    });
  });

});


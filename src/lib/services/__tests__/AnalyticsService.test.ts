import { AnalyticsService } from '../AnalyticsService';
import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';
import {
  mockPrismaCount,
  mockPrismaAggregateResult,
  mockPrismaEmptyResult,
  setupPrismaMocks,
  mockPrismaError,
} from './helpers';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $runCommandRaw: jest.fn(),
  },
}));

jest.mock('@/lib/MongoDbHelper');

describe('AnalyticsService', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('getAnalyticsData', () => 
  {
    it('should return analytics data with all metrics', async () => 
    {
      setupPrismaMocks([
        mockPrismaCount(10), // totalPlaces
        mockPrismaCount(25), // totalBookings
        mockPrismaCount(5),  // activeBookings
        mockPrismaAggregateResult([ // bookingStatusBreakdown
          { _id: 'CONFIRMED', count: 15 },
          { _id: 'PENDING', count: 5 },
          { _id: 'CANCELLED', count: 3 },
          { _id: 'COMPLETED', count: 2 },
        ]),
        mockPrismaAggregateResult([ // totalRevenue
          { totalRevenue: 5000.50 },
        ]),
        mockPrismaAggregateResult([ // monthlyBookings
          {
            _id: { year: 2024, month: 1 },
            count: 5,
            totalRevenue: 1000,
          },
          {
            _id: { year: 2024, month: 2 },
            count: 8,
            totalRevenue: 1500,
          },
        ]),
        mockPrismaAggregateResult([ // topPlaces
          {
            _id: { $oid: '507f1f77bcf86cd799439011' },
            bookingCount: 10,
            totalRevenue: 2000,
          },
          {
            _id: { $oid: '507f1f77bcf86cd799439012' },
            bookingCount: 8,
            totalRevenue: 1500,
          },
        ]),
        mockPrismaAggregateResult([ // avgBookingValue
          { avgValue: 200.25 },
        ]),
      ]);

      const result = await AnalyticsService.getAnalyticsData();

      expect(result.totalPlaces).toBe(10);
      expect(result.totalBookings).toBe(25);
      expect(result.activeBookings).toBe(5);
      expect(result.bookingStatusBreakdown).toHaveLength(4);
      expect(result.totalRevenue).toBe(5000.50);
      expect(result.monthlyBookings).toHaveLength(2);
      expect(result.topPlaces).toHaveLength(2);
      expect(result.avgBookingValue).toBe(200.25);
    });

    it('should return default values when no data exists', async () => 
    {
      setupPrismaMocks([
        mockPrismaCount(0), // totalPlaces
        mockPrismaCount(0), // totalBookings
        mockPrismaCount(0), // activeBookings
        mockPrismaEmptyResult(), // bookingStatusBreakdown
        mockPrismaEmptyResult(), // totalRevenue
        mockPrismaEmptyResult(), // monthlyBookings
        mockPrismaEmptyResult(), // topPlaces
        mockPrismaEmptyResult(), // avgBookingValue
      ]);

      const result = await AnalyticsService.getAnalyticsData();

      expect(result.totalPlaces).toBe(0);
      expect(result.totalBookings).toBe(0);
      expect(result.activeBookings).toBe(0);
      expect(result.bookingStatusBreakdown).toEqual([]);
      expect(result.totalRevenue).toBe(0);
      expect(result.monthlyBookings).toEqual([]);
      expect(result.topPlaces).toEqual([]);
      expect(result.avgBookingValue).toBe(0);
    });

    it('should handle missing revenue data gracefully', async () => 
    {
      setupPrismaMocks([
        mockPrismaCount(5), // totalPlaces
        mockPrismaCount(10), // totalBookings
        mockPrismaCount(3), // activeBookings
        mockPrismaAggregateResult([ // bookingStatusBreakdown
          { _id: 'PENDING', count: 3 },
        ]),
        mockPrismaEmptyResult(), // totalRevenue - empty result
        mockPrismaEmptyResult(), // monthlyBookings
        mockPrismaEmptyResult(), // topPlaces
        mockPrismaEmptyResult(), // avgBookingValue
      ]);

      const result = await AnalyticsService.getAnalyticsData();

      expect(result.totalRevenue).toBe(0);
    });

    it('should handle errors gracefully and return default values', async () => 
    {
      mockPrismaError(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await AnalyticsService.getAnalyticsData();

      expect(result.totalPlaces).toBe(0);
      expect(result.totalBookings).toBe(0);
      expect(result.activeBookings).toBe(0);
      expect(result.bookingStatusBreakdown).toEqual([]);
      expect(result.totalRevenue).toBe(0);
      expect(result.monthlyBookings).toEqual([]);
      expect(result.topPlaces).toEqual([]);
      expect(result.avgBookingValue).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle null/undefined count results', async () => 
    {
      setupPrismaMocks([
        {}, // totalPlaces - no n property
        { n: null }, // totalBookings - null
        { n: undefined }, // activeBookings - undefined
        mockPrismaEmptyResult(), // bookingStatusBreakdown
        mockPrismaEmptyResult(), // totalRevenue
        mockPrismaEmptyResult(), // monthlyBookings
        mockPrismaEmptyResult(), // topPlaces
        mockPrismaEmptyResult(), // avgBookingValue
      ]);

      const result = await AnalyticsService.getAnalyticsData();

      expect(result.totalPlaces).toBe(0);
      expect(result.totalBookings).toBe(0);
      expect(result.activeBookings).toBe(0);
    });
  });

  describe('objectIdToString', () => 
  {
    it('should convert ObjectId with $oid to string', () => 
    {
      const id = { $oid: '507f1f77bcf86cd799439011' };
      (MongoDbHelper.extractObjectId as jest.Mock).mockReturnValue('507f1f77bcf86cd799439011');
      
      const result = AnalyticsService.objectIdToString(id);
      
      expect(MongoDbHelper.extractObjectId).toHaveBeenCalledWith(id);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle string IDs', () => 
    {
      const id = '507f1f77bcf86cd799439011';
      (MongoDbHelper.extractObjectId as jest.Mock).mockReturnValue('507f1f77bcf86cd799439011');
      
      const result = AnalyticsService.objectIdToString(id);
      
      expect(MongoDbHelper.extractObjectId).toHaveBeenCalledWith(id);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle null/undefined IDs', () => 
    {
      (MongoDbHelper.extractObjectId as jest.Mock).mockReturnValue('');
      
      expect(AnalyticsService.objectIdToString(null)).toBe('');
      expect(AnalyticsService.objectIdToString(undefined)).toBe('');
    });
  });
});


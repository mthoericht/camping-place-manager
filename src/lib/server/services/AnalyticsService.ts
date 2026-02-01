import 'server-only';
import { prisma } from '@/lib/server/prisma';
import { MongoDbHelper } from '@/lib/server/MongoDbHelper';

/**
 * Analytics data interface
 */
export interface AnalyticsData {
  totalPlaces: number;
  totalBookings: number;
  activeBookings: number;
  bookingStatusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  totalRevenue: number;
  monthlyBookings: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    totalRevenue: number;
  }>;
  topPlaces: Array<{
    _id: any;
    bookingCount: number;
    totalRevenue: number;
  }>;
  avgBookingValue: number;
}

/**
 * Service class for analytics-related operations
 */
export class AnalyticsService 
{
  /**
   * Get comprehensive analytics data
   */
  static async getAnalyticsData(): Promise<AnalyticsData> 
  {
    try 
    {
      // Get basic counts using raw MongoDB queries
      const placesResult = await prisma.$runCommandRaw({
        count: 'camping_places'
      });
      
      const bookingsResult = await prisma.$runCommandRaw({
        count: 'bookings'
      });
      
      const activeBookingsResult = await prisma.$runCommandRaw({
        count: 'bookings',
        query: {
          status: { $in: ['PENDING', 'CONFIRMED', 'PAID'] }
        }
      });
      
      const totalPlaces = Number(placesResult.n) || 0;
      const totalBookings = Number(bookingsResult.n) || 0;
      const activeBookings = Number(activeBookingsResult.n) || 0;

      // Get booking status breakdown using aggregation
      const statusBreakdownResult = await prisma.$runCommandRaw({
        aggregate: 'bookings',
        pipeline: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        cursor: {}
      });
      
      const bookingStatusBreakdown = (statusBreakdownResult.cursor as any)?.firstBatch || [];

      // Get revenue data using aggregation
      const revenueResult = await prisma.$runCommandRaw({
        aggregate: 'bookings',
        pipeline: [
          {
            $match: {
              status: { $in: ['CONFIRMED', 'PAID', 'COMPLETED'] }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalPrice' }
            }
          }
        ],
        cursor: {}
      });
      
      const totalRevenue = (revenueResult.cursor as any)?.firstBatch?.[0]?.totalRevenue || 0;

      // Get monthly booking trends (last 6 months) using aggregation
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyBookingsResult = await prisma.$runCommandRaw({
        aggregate: 'bookings',
        pipeline: [
          {
            $match: {
              createdAt: { $gte: sixMonthsAgo }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 },
              totalRevenue: { $sum: '$totalPrice' }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }
          }
        ],
        cursor: {}
      });
      
      const monthlyBookings = (monthlyBookingsResult.cursor as any)?.firstBatch || [];

      // Get top camping places by bookings using aggregation
      const topPlacesResult = await prisma.$runCommandRaw({
        aggregate: 'bookings',
        pipeline: [
          {
            $group: {
              _id: '$campingPlaceId',
              bookingCount: { $sum: 1 },
              totalRevenue: { $sum: '$totalPrice' }
            }
          },
          {
            $sort: { bookingCount: -1 }
          },
          {
            $limit: 5
          }
        ],
        cursor: {}
      });
      
      const topPlaces = (topPlacesResult.cursor as any)?.firstBatch || [];

      // Get average booking value using aggregation
      const avgBookingResult = await prisma.$runCommandRaw({
        aggregate: 'bookings',
        pipeline: [
          {
            $group: {
              _id: null,
              avgValue: { $avg: '$totalPrice' }
            }
          }
        ],
        cursor: {}
      });
      
      const averageBookingValue = (avgBookingResult.cursor as any)?.firstBatch?.[0]?.avgValue || 0;

      return {
        totalPlaces,
        totalBookings,
        activeBookings,
        bookingStatusBreakdown,
        totalRevenue: totalRevenue || 0,
        monthlyBookings,
        topPlaces,
        avgBookingValue: averageBookingValue || 0,
      };
    } 
    catch (error) 
    {
      console.error('Error fetching analytics data:', error);
      return {
        totalPlaces: 0,
        totalBookings: 0,
        activeBookings: 0,
        bookingStatusBreakdown: [],
        totalRevenue: 0,
        monthlyBookings: [],
        topPlaces: [],
        avgBookingValue: 0,
      };
    }
  }

  /**
   * Convert ObjectId to string (for display purposes)
   */
  static objectIdToString(id: any): string 
  {
    return MongoDbHelper.extractObjectId(id);
  }
}


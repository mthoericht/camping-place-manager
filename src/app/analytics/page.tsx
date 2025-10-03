import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getAnalyticsData() {
  try {
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
        status: { $in: ['PENDING', 'CONFIRMED'] }
      }
    });
    
    const totalPlaces = placesResult.n || 0;
    const totalBookings = bookingsResult.n || 0;
    const activeBookings = activeBookingsResult.n || 0;

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
      ]
    });
    
    const bookingStatusBreakdown = (statusBreakdownResult.cursor as any)?.firstBatch || [];

    // Get revenue data using aggregation
    const revenueResult = await prisma.$runCommandRaw({
      aggregate: 'bookings',
      pipeline: [
        {
          $match: {
            status: { $in: ['CONFIRMED', 'COMPLETED'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]
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
      ]
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
      ]
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
      ]
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
  } catch (error) {
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

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Comprehensive insights into your camping business
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-blue-600 mr-4">🏕️</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Places</p>
                <p className="text-2xl font-bold text-gray-900">{Number(analytics.totalPlaces) || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-green-600 mr-4">📅</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{Number(analytics.totalBookings) || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-yellow-600 mr-4">⏳</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{Number(analytics.activeBookings) || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-purple-600 mr-4">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Status Breakdown</h2>
            <div className="space-y-3">
              {analytics.bookingStatusBreakdown.map((status: any) => (
                <div key={status._id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        status._id === 'CONFIRMED'
                          ? 'bg-green-500'
                          : status._id === 'PENDING'
                            ? 'bg-yellow-500'
                            : status._id === 'CANCELLED'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                      }`}
                    ></div>
                    <span className="text-gray-700 capitalize">{status._id?.toLowerCase()}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Average Booking Value */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Average Booking Value</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                ${analytics.avgBookingValue.toFixed(2)}
              </div>
              <p className="text-gray-600">Per confirmed booking</p>
            </div>
          </div>
        </div>

        {/* Top Camping Places */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Camping Places by Bookings
            </h2>
            {analytics.topPlaces.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPlaces.map((place: any, index: number) => (
                  <div
                    key={place._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Camping Place ID: {place._id}</h3>
                        <p className="text-sm text-gray-600">Revenue: ${place.totalRevenue?.toFixed(2) || 0}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {place.bookingCount} bookings
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-400 mb-4">📊</div>
                <p className="text-gray-600">No booking data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/camping-places/new"
                className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
              >
                Add New Place
              </Link>
              <Link
                href="/bookings/new"
                className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-center block"
              >
                Create Booking
              </Link>
              <Link
                href="/bookings"
                className="bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors text-center block"
              >
                View All Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {analytics.totalPlaces === 0 && analytics.totalBookings === 0 && (
          <div className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding camping places and creating bookings to see analytics
            </p>
            <div className="space-x-4">
              <Link
                href="/camping-places/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add First Place
              </Link>
              <Link
                href="/bookings/new"
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Create First Booking
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

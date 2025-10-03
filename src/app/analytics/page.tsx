import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getAnalyticsData() {
  try {
    // Get basic counts
    const totalPlaces = await prisma.campingPlace.count();
    const totalBookings = await prisma.booking.count();
    const activeBookings = await prisma.booking.count({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // Get booking status breakdown
    const bookingStatusBreakdown = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Get revenue data
    const totalRevenue = await prisma.booking.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
    });

    // Get monthly booking trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      _sum: {
        totalPrice: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get top camping places by bookings
    const topPlaces = await prisma.campingPlace.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get average booking value
    const avgBookingValue = await prisma.booking.aggregate({
      _avg: {
        totalPrice: true,
      },
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
    });

    return {
      totalPlaces,
      totalBookings,
      activeBookings,
      bookingStatusBreakdown,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyBookings,
      topPlaces,
      avgBookingValue: avgBookingValue._avg.totalPrice || 0,
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
                <p className="text-2xl font-bold text-gray-900">{analytics.totalPlaces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-green-600 mr-4">📅</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-yellow-600 mr-4">⏳</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeBookings}</p>
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
              {analytics.bookingStatusBreakdown.map(status => (
                <div key={status.status} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        status.status === 'CONFIRMED'
                          ? 'bg-green-500'
                          : status.status === 'PENDING'
                            ? 'bg-yellow-500'
                            : status.status === 'CANCELLED'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                      }`}
                    ></div>
                    <span className="text-gray-700 capitalize">{status.status.toLowerCase()}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{status._count.status}</span>
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
                {analytics.topPlaces.map((place, index) => (
                  <div
                    key={place.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{place.name}</h3>
                        <p className="text-sm text-gray-600">{place.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {place._count.bookings} bookings
                      </div>
                      <div className="text-sm text-gray-600">${place.price}/night</div>
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

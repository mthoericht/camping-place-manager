import Link from 'next/link';
import { AnalyticsService } from '@/lib/server/services/AnalyticsService';

export default async function AnalyticsPage() {
  const analytics = await AnalyticsService.getAnalyticsData();

  const metricCardClass = "bg-white rounded-lg shadow-md p-6";
  const sectionCardClass = "bg-white rounded-lg shadow-md p-6";
  const actionButtonClass = "bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block";

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
          <div className={metricCardClass}>
            <div className="flex items-center">
              <div className="text-3xl text-blue-600 mr-4">🏕️</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Places</p>
                <p className="text-2xl font-bold text-gray-900">{Number(analytics.totalPlaces) || 0}</p>
              </div>
            </div>
          </div>

          <div className={metricCardClass}>
            <div className="flex items-center">
              <div className="text-3xl text-green-600 mr-4">📅</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{Number(analytics.totalBookings) || 0}</p>
              </div>
            </div>
          </div>

          <div className={metricCardClass}>
            <div className="flex items-center">
              <div className="text-3xl text-yellow-600 mr-4">⏳</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{Number(analytics.activeBookings) || 0}</p>
              </div>
            </div>
          </div>

          <div className={metricCardClass}>
            <div className="flex items-center">
              <div className="text-3xl text-purple-600 mr-4">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalRevenue.toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Status Breakdown */}
          <div className={sectionCardClass}>
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
                            : status._id === 'PAID'
                              ? 'bg-emerald-500'
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
          <div className={sectionCardClass}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Average Booking Value</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {analytics.avgBookingValue.toFixed(2)} €
              </div>
              <p className="text-gray-600">Per confirmed booking</p>
            </div>
          </div>
        </div>

        {/* Top Camping Places */}
        <div className="mt-8">
          <div className={sectionCardClass}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Camping Places by Bookings
            </h2>
            {analytics.topPlaces.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPlaces.map((place: any, index: number) => (
                  <div
                    key={AnalyticsService.objectIdToString(place._id)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Camping Place ID: {AnalyticsService.objectIdToString(place._id)}</h3>
                        <p className="text-sm text-gray-600">Revenue: {place.totalRevenue?.toFixed(2) ?? '0'} €</p>
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
          <div className={sectionCardClass}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/camping-places/new"
                className={actionButtonClass}
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

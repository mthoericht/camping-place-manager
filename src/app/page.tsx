import Link from 'next/link';
import Stats from '@/components/Stats';
import { AnalyticsService } from '@/lib/server/services/AnalyticsService';

export default async function Home() {
  // Fetch quick stats data
  const analytics = await AnalyticsService.getAnalyticsData();
  const cardClass = "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow";
  const buttonBaseClass = "inline-block text-white px-4 py-2 rounded-md transition-colors";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Camping Place Manager</h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your camping places and bookings with ease
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className={cardClass}>
            <div className="text-3xl mb-4">🏕️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Camping Places</h3>
            <p className="text-gray-600 mb-4">View and manage all your camping places</p>
            <Link href="/camping-places" className={`${buttonBaseClass} bg-blue-600 hover:bg-blue-700`}>
              Manage Places
            </Link>
          </div>

          <div className={cardClass}>
            <div className="text-3xl mb-4">🎒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Camping Items</h3>
            <p className="text-gray-600 mb-4">Manage camping equipment and items</p>
            <Link href="/camping-items" className={`${buttonBaseClass} bg-orange-600 hover:bg-orange-700`}>
              Manage Items
            </Link>
          </div>

          <div className={cardClass}>
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h3>
            <p className="text-gray-600 mb-4">Track and manage customer bookings</p>
            <Link href="/bookings" className={`${buttonBaseClass} bg-green-600 hover:bg-green-700`}>
              View Bookings
            </Link>
          </div>

          <div className={cardClass}>
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">View booking statistics and reports</p>
            <Link href="/analytics" className={`${buttonBaseClass} bg-purple-600 hover:bg-purple-700`}>
              View Analytics
            </Link>
          </div>
        </div>

        <Stats 
          totalPlaces={analytics.totalPlaces} 
          activeBookings={analytics.activeBookings} 
        />
      </div>
    </div>
  );
}

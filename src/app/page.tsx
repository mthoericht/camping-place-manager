import Link from 'next/link';

export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Camping Place Manager</h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your camping places and bookings with ease
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">🏕️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Camping Places</h3>
            <p className="text-gray-600 mb-4">View and manage all your camping places</p>
            <Link href="/camping-places" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Manage Places
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h3>
            <p className="text-gray-600 mb-4">Track and manage customer bookings</p>
            <Link href="/bookings" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              View Bookings
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">View booking statistics and reports</p>
            <Link href="/analytics" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              View Analytics
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-gray-600">Total Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-gray-600">Active Bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
        <p className="text-gray-600 mb-8">
          The booking you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="space-x-4">
          <Link
            href="/bookings"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Bookings
          </Link>
          <Link
            href="/bookings/new"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Create New Booking
          </Link>
          <Link
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { BookingService, Booking } from '@/lib/server/services/BookingService';

export default async function BookingsPage() {
  let bookings: Booking[] = [];
  let error: Error | null = null;

  try {
    bookings = await BookingService.getBookings();
  } catch (err) {
    error = err as Error;
    console.error('Error in BookingsPage:', err);
  }

  const tableHeaderClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tableCellBaseClass = "px-6 py-4 whitespace-nowrap";
  const tableCellTextClass = `${tableCellBaseClass} text-sm text-gray-900`;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <Link
          href="/bookings/new"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          New Booking
        </Link>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Error</h3>
          <p className="text-gray-600 mb-6">
            Unable to connect to the database. Please check your MongoDB connection.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">
            Bookings will appear here once customers start making reservations
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={tableHeaderClass}>
                  Customer
                </th>
                <th className={tableHeaderClass}>
                  Camping Place
                </th>
                <th className={tableHeaderClass}>
                  Dates
                </th>
                <th className={tableHeaderClass}>
                  Guests
                </th>
                <th className={tableHeaderClass}>
                  Total
                </th>
                <th className={tableHeaderClass}>
                  Status
                </th>
                <th className={tableHeaderClass}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking: Booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className={tableCellBaseClass}>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    </div>
                  </td>
                  <td className={tableCellBaseClass}>
                    <div className="text-sm text-gray-900">
                      {booking.campingPlace?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.campingPlace?.location || 'Unknown'}
                    </div>
                  </td>
                  <td className={tableCellBaseClass}>
                    <div className="text-sm text-gray-900">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={tableCellTextClass}>
                    {booking.guests}
                  </td>
                  <td className={tableCellTextClass}>
                    ${booking.totalPrice.toFixed(2)}
                  </td>
                  <td className={tableCellBaseClass}>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className={`${tableCellBaseClass} text-sm font-medium`}>
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

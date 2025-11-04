import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Booking {
  id: string;
  campingPlaceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  campingPlace?: {
    id: string;
    name: string;
    location: string;
  };
}

// Helper function to parse MongoDB date format
function parseMongoDate(date: any): string {
  if (!date) return '';
  if (date.$date) {
    return date.$date;
  }
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string') {
    return date;
  }
  return '';
}

async function getBookings(): Promise<Booking[]> {
  try {
    const bookingsResult = await prisma.$runCommandRaw({
      find: 'bookings',
      sort: { createdAt: -1 }
    });
    
    const bookings = (bookingsResult.cursor as any)?.firstBatch || [];
    
    // Get all camping places to map them to bookings
    const placesResult = await prisma.$runCommandRaw({
      find: 'camping_places'
    });
    const campingPlaces = (placesResult.cursor as any)?.firstBatch || [];
    const placesMap = new Map(
      campingPlaces.map((place: any) => [
        place._id.$oid,
        {
          id: place._id.$oid,
          name: place.name,
          location: place.location
        }
      ])
    );
    
    // Map MongoDB _id to id and include camping place data
    const mappedBookings = bookings.map((booking: any): Booking => {
      // Handle campingPlaceId - it might be ObjectId or string
      let campingPlaceId: string;
      if (booking.campingPlaceId?.$oid) {
        campingPlaceId = booking.campingPlaceId.$oid;
      } else if (typeof booking.campingPlaceId === 'string') {
        campingPlaceId = booking.campingPlaceId;
      } else {
        campingPlaceId = String(booking.campingPlaceId);
      }
      
      const campingPlace = campingPlaceId ? placesMap.get(campingPlaceId) : undefined;
      
      return {
        id: booking._id.$oid,
        campingPlaceId: campingPlaceId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        startDate: parseMongoDate(booking.startDate),
        endDate: parseMongoDate(booking.endDate),
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
        notes: booking.notes,
        createdAt: parseMongoDate(booking.createdAt),
        updatedAt: parseMongoDate(booking.updatedAt),
        campingPlace: campingPlace as { id: string; name: string; location: string } | undefined
      };
    });
    
    return mappedBookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export default async function BookingsPage() {
  let bookings: Booking[] = [];
  let error: Error | null = null;

  try {
    bookings = await getBookings();
  } catch (err) {
    error = err as Error;
    console.error('Error in BookingsPage:', err);
  }

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Camping Place
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking: Booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.campingPlace?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.campingPlace?.location || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.guests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CampingPlaceService } from '@/lib/server/services/CampingPlaceService';
import { EditButtonLink, ViewButtonLink, ViewTextLink } from '@/components/ui';

export default async function CampingPlaceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campingPlace = await CampingPlaceService.getCampingPlace(id);

  if (!campingPlace) {
    notFound();
  }

  const tableHeaderClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tableCellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/camping-places"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Camping Places
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{campingPlace.name}</h1>
          <p className="text-lg text-gray-600 mt-2">{campingPlace.location}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2">
            {/* Placeholder Image */}
            <div className="mb-8">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-6xl text-gray-400">🏕️</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">
                {campingPlace.description || 'No description available.'}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Amenities</h2>
              {campingPlace.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {campingPlace.amenities.map((amenity: any, index: any) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed.</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Info and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{campingPlace.price} €</div>
                <div className="text-gray-600">per night</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{campingPlace.size} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${campingPlace.isActive ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {campingPlace.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span className="font-medium">{campingPlace.bookings?.length || 0}</span>
                </div>
              </div>

              <div className="space-y-3">
                <EditButtonLink href={`/camping-places/${campingPlace.id}/edit`}>
                  Edit Place
                </EditButtonLink>
                <ViewButtonLink href={`/bookings?campingPlace=${campingPlace.id}`}>
                  View Bookings
                </ViewButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        {campingPlace.bookings && campingPlace.bookings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Bookings</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={tableHeaderClass}>
                        Customer
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(campingPlace.bookings || []).slice(0, 5).map((booking: any) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customerName}
                            </div>
                            <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                          </div>
                        </td>
                        <td className={tableCellClass}>
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                        <td className={tableCellClass}>
                          {booking.guests}
                        </td>
                        <td className={tableCellClass}>
                          {booking.totalPrice.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : booking.status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : booking.status === 'CANCELLED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {campingPlace.bookings && campingPlace.bookings.length > 5 && (
                <div className="bg-gray-50 px-6 py-3 text-center">
                  <ViewTextLink href={`/bookings?campingPlace=${campingPlace.id}`}>
                    View all {campingPlace.bookings.length} bookings
                  </ViewTextLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

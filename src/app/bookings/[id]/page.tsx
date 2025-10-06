import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getBooking(id: string) {
  try {
    // Use the API route to get booking with all related data including camping items
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const booking = await response.json();
    console.log('Booking details page - Raw booking data:', booking);
    console.log('Booking details page - Booking items:', booking.bookingItems);
    
    // Transform the booking data to match the expected format
    return {
      ...booking,
      id: booking.id,
      campingPlace: {
        ...booking.campingPlace,
        id: booking.campingPlace.id,
      },
      bookingItems: booking.bookingItems || [],
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  // Handle MongoDB date format
  const startDate = booking.startDate?.$date
    ? new Date(booking.startDate.$date)
    : new Date(booking.startDate);
  const endDate = booking.endDate?.$date
    ? new Date(booking.endDate.$date)
    : new Date(booking.endDate);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/bookings"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Bookings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-lg text-gray-600 mt-2">Booking #{booking.id.slice(-8)}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-lg text-gray-900">{booking.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-lg text-gray-900">{booking.customerEmail}</p>
                </div>
                {booking.customerPhone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-lg text-gray-900">{booking.customerPhone}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Status</label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
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
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                  <p className="text-lg text-gray-900">{startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                  <p className="text-lg text-gray-900">{endDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Nights
                  </label>
                  <p className="text-lg text-gray-900">{nights}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Guests
                  </label>
                  <p className="text-lg text-gray-900">{booking.guests}</p>
                </div>
              </div>
            </div>

            {/* Camping Items */}
            {booking.bookingItems && booking.bookingItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selected Camping Items</h2>
                <div className="space-y-3">
                  {booking.bookingItems.map((bookingItem: any) => {
                    console.log('Rendering booking item:', bookingItem);
                    console.log('Camping item data:', bookingItem.campingItem);
                    return (
                    <div
                      key={bookingItem.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {bookingItem.campingItem?.name || 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {bookingItem.campingItem?.category || 'Unknown Category'} - {bookingItem.campingItem?.size || 0} m&#178;
                          {bookingItem.campingItem?.description && ` - ${bookingItem.campingItem.description}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">Quantity: {bookingItem.quantity}</div>
                        <div className="text-sm text-gray-600">
                          Total size: {(bookingItem.campingItem?.size || 0) * bookingItem.quantity} m&#178;
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Items Selected:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {booking.bookingItems.reduce((total: number, item: any) => total + item.quantity, 0)} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium text-gray-700">Total Size Used:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {booking.bookingItems.reduce((total: number, item: any) => 
                        total + ((item.campingItem?.size || 0) * item.quantity), 0
                      )} m&#178;
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Camping Place & Actions */}
          <div className="lg:col-span-1">
            {/* Camping Place Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Camping Place</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{booking.campingPlace.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{booking.campingPlace.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                  <p className="text-gray-900">${booking.campingPlace.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <p className="text-gray-900">{booking.campingPlace.size} m&#178;</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/camping-places/${booking.campingPlace.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Camping Place Details →
                </Link>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per night:</span>
                  <span>${booking.campingPlace.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of nights:</span>
                  <span>{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of guests:</span>
                  <span>{booking.guests}</span>
                </div>
                {booking.bookingItems && booking.bookingItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Camping items:</span>
                    <span>{booking.bookingItems.reduce((total: number, item: any) => total + item.quantity, 0)} items</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Price:</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/bookings/${booking.id}/edit`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                >
                  Edit Booking
                </Link>
                <Link
                  href={`/camping-places/${booking.campingPlace.id}`}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-center block"
                >
                  View Camping Place
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Timeline */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking Timeline</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Booking Created</p>
                  <p className="text-sm text-gray-500">
                    {booking.createdAt?.$date
                      ? new Date(booking.createdAt.$date).toLocaleString()
                      : new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">
                    {booking.updatedAt?.$date
                      ? new Date(booking.updatedAt.$date).toLocaleString()
                      : new Date(booking.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

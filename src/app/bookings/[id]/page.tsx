import Link from 'next/link';
import { BookingService } from '@/lib/server/services/BookingService';
import { MongoDbHelper } from '@/lib/server/MongoDbHelper';
import { notFound } from 'next/navigation';
import { BookingStatusSelect } from '@/components/BookingStatusSelect';

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await BookingService.getBooking(id);

  if (!booking) 
  {
    notFound();
  }

  // Handle MongoDB date format
  const startDate = new Date(MongoDbHelper.parseMongoDate(booking.startDate));
  const endDate = new Date(MongoDbHelper.parseMongoDate(booking.endDate));
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const sectionClass = "bg-white rounded-lg shadow-md p-6 mb-6";
  const labelClass = "block text-sm font-medium text-gray-700";
  const valueClass = "text-lg text-gray-900";

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
            <div className={sectionClass}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <p className={valueClass}>{booking.customerName}</p>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <p className={valueClass}>{booking.customerEmail}</p>
                </div>
                {booking.customerPhone && (
                  <div>
                    <label className={labelClass}>Phone</label>
                    <p className={valueClass}>{booking.customerPhone}</p>
                  </div>
                )}
                <div>
                  <label className={labelClass}>Booking Status</label>
                  <BookingStatusSelect 
                    bookingId={booking.id} 
                    currentStatus={booking.status as 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED'} 
                  />
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className={sectionClass}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Check-in Date</label>
                  <p className={valueClass}>{startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className={labelClass}>Check-out Date</label>
                  <p className={valueClass}>{endDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className={labelClass}>
                    Number of Nights
                  </label>
                  <p className={valueClass}>{nights}</p>
                </div>
                <div>
                  <label className={labelClass}>
                    Number of Guests
                  </label>
                  <p className={valueClass}>{booking.guests}</p>
                </div>
              </div>
            </div>

            {/* Camping Items */}
            {booking.bookingItems && booking.bookingItems.length > 0 && (
              <div className={sectionClass}>
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
              <div className={sectionClass}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Camping Place & Actions */}
          <div className="lg:col-span-1">
            {/* Camping Place Info */}
            <div className={sectionClass}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Camping Place</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Name</label>
                  <p className="text-gray-900">{booking.campingPlace.name}</p>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <p className="text-gray-900">{booking.campingPlace.location}</p>
                </div>
                <div>
                  <label className={labelClass}>Price per night (€)</label>
                  <p className="text-gray-900">{booking.campingPlace.price} €</p>
                </div>
                <div>
                  <label className={labelClass}>Size</label>
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
            <div className={sectionClass}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per night (€):</span>
                  <span>{booking.campingPlace.price} €</span>
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
                  <span>Total price:</span>
                  <span>{booking.totalPrice.toFixed(2)} €</span>
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
                    {MongoDbHelper.parseMongoDate(booking.createdAt) 
                      ? new Date(MongoDbHelper.parseMongoDate(booking.createdAt)).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">
                    {MongoDbHelper.parseMongoDate(booking.updatedAt) 
                      ? new Date(MongoDbHelper.parseMongoDate(booking.updatedAt)).toLocaleString()
                      : 'Unknown'}
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

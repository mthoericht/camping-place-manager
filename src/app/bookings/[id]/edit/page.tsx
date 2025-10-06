import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BookingForm from '@/components/BookingForm';
import { notFound } from 'next/navigation';

async function getBooking(id: string) {
  try {
    // Use the API route to get booking with all related data including camping items
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      return null;
    }
    
    const booking = await response.json();
    console.log('Raw API response:', booking);
    console.log('Booking items from API:', booking.bookingItems);
    
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

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  // Convert the booking data to the format expected by BookingForm
  const initialData = {
    id: booking.id,
    campingPlaceId: booking.campingPlace.id, // Use the mapped camping place id
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone || undefined,
    startDate: (booking.startDate?.$date
      ? new Date(booking.startDate.$date)
      : new Date(booking.startDate)
    )
      .toISOString()
      .split('T')[0], // Convert to YYYY-MM-DD format
    endDate: (booking.endDate?.$date ? new Date(booking.endDate.$date) : new Date(booking.endDate))
      .toISOString()
      .split('T')[0], // Convert to YYYY-MM-DD format
    guests: booking.guests,
    notes: booking.notes || undefined,
    campingItems: (() => {
      console.log('Booking bookingItems:', booking.bookingItems);
      const items = booking.bookingItems?.reduce((acc: { [key: string]: number }, item: any) => {
        console.log('Processing booking item:', item);
        // Prisma returns campingItemId as a string, not ObjectId
        const itemId = item.campingItemId;
        console.log('Item ID:', itemId, 'Quantity:', item.quantity);
        acc[itemId] = item.quantity;
        return acc;
      }, {}) || {};
      console.log('Transformed camping items:', items);
      return items;
    })(),
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/bookings/${id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Booking Details
          </Link>
        </div>

        <BookingForm initialData={initialData} />
      </div>
    </div>
  );
}

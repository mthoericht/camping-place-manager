import BookingForm from '@/components/BookingForm';
import { BookingService } from '@/lib/server/services/BookingService';
import { MongoDbHelper } from '@/lib/server/MongoDbHelper';
import { notFound } from 'next/navigation';
import { BackLink, PageContainer } from '@/components/ui';

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await BookingService.getBooking(id);

  if (!booking) {
    notFound();
  }

  // Convert the booking data to the format expected by BookingForm
  const initialData = {
    id: booking.id,
    campingPlaceId: booking.campingPlace.id,
    campingPlace: {
      id: booking.campingPlace.id,
      name: booking.campingPlace.name,
      size: booking.campingPlace.size,
      price: booking.campingPlace.price,
    },
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone || undefined,
    startDate: new Date(MongoDbHelper.parseMongoDate(booking.startDate))
      .toISOString()
      .split('T')[0],
    endDate: new Date(MongoDbHelper.parseMongoDate(booking.endDate))
      .toISOString()
      .split('T')[0],
    guests: booking.guests,
    notes: booking.notes || undefined,
    campingItems: booking.bookingItems?.reduce((acc: { [key: string]: number }, item: { campingItemId: string; quantity: number }) => 
    {
      acc[item.campingItemId] = item.quantity;
      return acc;
    }, {} as { [key: string]: number }) || {},
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <BackLink href={`/bookings/${id}`} text="Back to Booking Details" />

        <BookingForm initialData={initialData} />
      </div>
    </PageContainer>
  );
}

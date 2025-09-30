import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BookingForm from '@/components/BookingForm'
import { notFound } from 'next/navigation'

async function getBooking(id: string) {
  try {
    const bookingResult = await prisma.$runCommandRaw({
      find: 'bookings',
      filter: { _id: { $oid: id } }
    })
    
    const booking = (bookingResult.cursor as any)?.firstBatch?.[0]
    if (!booking) return null
    
    const campingPlaceResult = await prisma.$runCommandRaw({
      find: 'camping_places',
      filter: { _id: booking.campingPlaceId }
    })
    
    const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0]
    
    return {
      ...booking,
      id: booking._id.$oid, // Map MongoDB _id to id
      campingPlace: {
        ...campingPlace,
        id: campingPlace._id.$oid // Map camping place _id to id
      }
    }
  } catch (error) {
    console.error('Error fetching booking:', error)
    return null
  }
}

export default async function EditBookingPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await getBooking(id)

  if (!booking) {
    notFound()
  }

  // Convert the booking data to the format expected by BookingForm
  const initialData = {
    id: booking.id,
    campingPlaceId: booking.campingPlace.id, // Use the mapped camping place id
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone || undefined,
    startDate: (booking.startDate?.$date ? new Date(booking.startDate.$date) : new Date(booking.startDate)).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    endDate: (booking.endDate?.$date ? new Date(booking.endDate.$date) : new Date(booking.endDate)).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    guests: booking.guests,
    notes: booking.notes || undefined,
  }

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
  )
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingService } from '@/lib/services/BookingService';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try 
  {
    const { id } = await params;
    console.log('API: Fetching booking with ID:', id);
    
    const booking = await BookingService.getBooking(id);

    if (!booking) 
    {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    console.log('API: Final booking object:', booking);
    return NextResponse.json(booking);
  }
  catch (error) 
  {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try 
  {
    const { id } = await params;
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      guests,
      status,
      notes,
      campingItems,
    } = body;

    // First, delete existing booking items
    await prisma.$runCommandRaw({
      delete: 'booking_items',
      deletes: [{ q: { bookingId: id }, limit: 0 }],
    });

    // Update the booking
    const updateData: any = {
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      notes: notes || null,
      updatedAt: MongoDbHelper.createMongoDate(), // Ensure proper DateTime format
    };

    if (startDate) 
    {
      updateData.startDate = MongoDbHelper.createMongoDate(new Date(startDate));
    }
    if (endDate) 
    {
      updateData.endDate = MongoDbHelper.createMongoDate(new Date(endDate));
    }
    if (guests) 
    {
      updateData.guests = parseInt(guests);
    }
    if (status) 
    {
      updateData.status = status;
    }

    await prisma.$runCommandRaw({
      update: 'bookings',
      updates: [{ q: { _id: MongoDbHelper.toObjectId(id) }, u: { $set: updateData } }],
    });

    // Create new booking items if provided
    if (campingItems) 
    {
      const itemsToCreate = Object.entries(campingItems).map(([itemId, quantity]) => ({
        bookingId: id,
        campingItemId: itemId,
        quantity: quantity as number,
        createdAt: MongoDbHelper.createMongoDate(),  // Ensure proper DateTime format
        updatedAt: MongoDbHelper.createMongoDate(),
      }));

      if (itemsToCreate.length > 0) 
      {
        await prisma.$runCommandRaw({
          insert: 'booking_items',
          documents: itemsToCreate,
        });
      }
    }

    // Fetch updated booking with items using raw query
    const bookingResult = await prisma.$runCommandRaw({
      find: 'bookings',
      filter: { _id: MongoDbHelper.toObjectId(id) },
    });

    const bookingItemsResult = await prisma.$runCommandRaw({
      find: 'booking_items',
      filter: { bookingId: id },
    });

    const booking = (bookingResult.cursor as any)?.firstBatch?.[0];
    const campingPlaceResult = await prisma.$runCommandRaw({
      find: 'camping_places',
      filter: { _id: booking?.campingPlaceId },
    });

    const bookingItems = (bookingItemsResult.cursor as any)?.firstBatch || [];
    const campingItemsResult = await prisma.$runCommandRaw({
      find: 'camping_items',
      filter: { _id: { $in: bookingItems.map((item: any) => item.campingItemId) } },
    });

    const updatedBooking = {
      ...(bookingResult.cursor as any)?.firstBatch?.[0],
      campingPlace: (campingPlaceResult.cursor as any)?.firstBatch?.[0],
      bookingItems:
        (bookingItemsResult.cursor as any)?.firstBatch?.map((item: any) => ({
          ...item,
          campingItem: (campingItemsResult.cursor as any)?.firstBatch?.find(
            (ci: any) => ci._id.$oid === item.campingItemId
          ),
        })) || [],
    };

    return NextResponse.json(updatedBooking);
  }
  catch (error) 
  {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) 
{
  try 
  {
    const { id } = await params;
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  }
  catch (error) 
  {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}

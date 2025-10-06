import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('API: Fetching booking with ID:', id);
    
    // Use raw MongoDB queries for more reliable data fetching
    const bookingResult = await prisma.$runCommandRaw({
      find: 'bookings',
      filter: { _id: { $oid: id } },
    });

    const booking = (bookingResult.cursor as any)?.firstBatch?.[0];
    console.log('API: Found booking:', booking);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get camping place
    const campingPlaceResult = await prisma.$runCommandRaw({
      find: 'camping_places',
      filter: { _id: booking.campingPlaceId },
    });

    const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0];
    console.log('API: Found camping place:', campingPlace);

    // Get booking items
    const bookingItemsResult = await prisma.$runCommandRaw({
      find: 'booking_items',
      filter: { bookingId: id },
    });

    const bookingItems = (bookingItemsResult.cursor as any)?.firstBatch || [];
    console.log('API: Found booking items:', bookingItems);

    let bookingItemsWithCampingItems = [];

    if (bookingItems.length > 0) {
      // Get camping items for these booking items
      const campingItemIds = bookingItems.map((item: any) => {
        return typeof item.campingItemId === 'object' && item.campingItemId.$oid 
          ? item.campingItemId.$oid 
          : item.campingItemId;
      });

      console.log('API: Camping item IDs to fetch:', campingItemIds);

      const campingItemsResult = await prisma.$runCommandRaw({
        find: 'camping_items',
        filter: { _id: { $in: campingItemIds.map((id: string) => ({ $oid: id })) } },
      });

      const campingItems = (campingItemsResult.cursor as any)?.firstBatch || [];
      console.log('API: Found camping items:', campingItems);

      // Transform the data
      bookingItemsWithCampingItems = bookingItems.map((item: any) => {
        // Handle both ObjectId and string formats for campingItemId
        const itemCampingItemId = typeof item.campingItemId === 'object' && item.campingItemId.$oid 
          ? item.campingItemId.$oid 
          : item.campingItemId;
        
        const campingItem = campingItems.find((ci: any) => {
          const ciId = typeof ci._id === 'object' && ci._id.$oid ? ci._id.$oid : ci._id;
          return ciId === itemCampingItemId;
        });

        console.log('Matching camping item for booking item:', {
          bookingItemId: item._id.$oid,
          campingItemId: itemCampingItemId,
          foundCampingItem: campingItem
        });

        return {
          id: item._id.$oid,
          bookingId: item.bookingId,
          campingItemId: itemCampingItemId,
          quantity: item.quantity,
          campingItem: campingItem ? {
            id: typeof campingItem._id === 'object' && campingItem._id.$oid ? campingItem._id.$oid : campingItem._id,
            name: campingItem.name,
            category: campingItem.category,
            size: campingItem.size,
            description: campingItem.description
          } : null,
        };
      });
    }

    // Construct the final booking object
    const finalBooking = {
      id: booking._id.$oid,
      campingPlaceId: booking.campingPlaceId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      campingPlace: campingPlace ? {
        id: campingPlace._id.$oid,
        name: campingPlace.name,
        description: campingPlace.description,
        location: campingPlace.location,
        size: campingPlace.size,
        price: campingPlace.price,
        amenities: campingPlace.amenities,
        isActive: campingPlace.isActive,
        createdAt: campingPlace.createdAt,
        updatedAt: campingPlace.updatedAt
      } : null,
      bookingItems: bookingItemsWithCampingItems
    };

    console.log('API: Final booking object:', finalBooking);
    return NextResponse.json(finalBooking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
      updatedAt: { $date: new Date().toISOString() }, // Ensure proper DateTime format
    };

    if (startDate) {
      updateData.startDate = { $date: new Date(startDate).toISOString() };
    }
    if (endDate) {
      updateData.endDate = { $date: new Date(endDate).toISOString() };
    }
    if (guests) {
      updateData.guests = parseInt(guests);
    }
    if (status) {
      updateData.status = status;
    }

    await prisma.$runCommandRaw({
      update: 'bookings',
      updates: [{ q: { _id: { $oid: id } }, u: { $set: updateData } }],
    });

    // Create new booking items if provided
    if (campingItems) {
      const itemsToCreate = Object.entries(campingItems).map(([itemId, quantity]) => ({
        bookingId: id,
        campingItemId: itemId,
        quantity: quantity as number,
        createdAt: { $date: new Date().toISOString() },  // Ensure proper DateTime format (Several API routes were using prisma.$runCommandRaw() with new Date() objects, which MongoDB was storing as strings instead of proper DateTime objects.)
        updatedAt: { $date: new Date().toISOString() },
      }));

      if (itemsToCreate.length > 0) {
        await prisma.$runCommandRaw({
          insert: 'booking_items',
          documents: itemsToCreate,
        });
      }
    }

    // Fetch updated booking with items using raw query
    const bookingResult = await prisma.$runCommandRaw({
      find: 'bookings',
      filter: { _id: { $oid: id } },
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
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}

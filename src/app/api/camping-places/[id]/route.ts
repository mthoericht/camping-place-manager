import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Use raw MongoDB query to avoid transaction requirements
    const campingPlaceResult = await prisma.$runCommandRaw({
      find: 'camping_places',
      filter: { _id: { $oid: id } },
    });

    const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0];

    if (!campingPlace) {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 });
    }

    // Get bookings for this camping place
    const bookingsResult = await prisma.$runCommandRaw({
      find: 'bookings',
      filter: { campingPlaceId: { $oid: id } },
      sort: { createdAt: -1 },
    });

    const bookings = (bookingsResult.cursor as any)?.firstBatch || [];

    // Map MongoDB _id to id and include bookings
    const mappedCampingPlace = {
      ...campingPlace,
      id: campingPlace._id.$oid,
      bookings: bookings.map((booking: any) => ({
        ...booking,
        id: booking._id.$oid,
      })),
    };

    return NextResponse.json(mappedCampingPlace);
  } catch (error) {
    console.error('Error fetching camping place:', error);
    return NextResponse.json({ error: 'Failed to fetch camping place' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, location, size, price, amenities, isActive } = body;

    // Use raw MongoDB update to avoid transaction requirements
    const updateData = {
      name,
      description,
      location,
      size: parseInt(size),
      price: parseFloat(price),
      amenities: amenities || [],
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
    };

    await prisma.$runCommandRaw({
      update: 'camping_places',
      updates: [
        {
          q: { _id: { $oid: id } },
          u: { $set: updateData },
        },
      ],
    });

    // Fetch the updated camping place
    const campingPlaceResult = await prisma.$runCommandRaw({
      find: 'camping_places',
      filter: { _id: { $oid: id } },
    });

    const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0];

    if (!campingPlace) {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 });
    }

    // Map MongoDB _id to id
    const mappedCampingPlace = {
      ...campingPlace,
      id: campingPlace._id.$oid,
    };

    return NextResponse.json(mappedCampingPlace);
  } catch (error) {
    console.error('Error updating camping place:', error);
    return NextResponse.json({ error: 'Failed to update camping place' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) : Promise<NextResponse>
{
  try {
    const { id } = await params;
    await prisma.campingPlace.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Camping place deleted successfully' });
  } catch (error) {
    console.error('Error deleting camping place:', error);
    return NextResponse.json({ error: 'Failed to delete camping place' }, { status: 500 });
  }
}

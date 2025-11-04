import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() 
{
  try 
  {
    const campingPlacesResult = await prisma.$runCommandRaw({
      find: 'camping_places',
      sort: { createdAt: -1 }
    });

    const campingPlaces = (campingPlacesResult.cursor as any)?.firstBatch || [];

    // Map MongoDB _id to id for each camping place
    const mappedCampingPlaces = campingPlaces.map((place: any) => ({
      ...place,
      id: place._id.$oid
    }));

    return NextResponse.json(mappedCampingPlaces);
  }
  catch (error) 
  {
    console.error('Error fetching camping places:', error);
    return NextResponse.json({ error: 'Failed to fetch camping places' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) 
{
  try 
  {
    const body = await request.json();
    const { name, description, location, size, price, amenities } = body;

    if (!name || !location || !size || !price) 
    {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campingPlace = await prisma.campingPlace.create({
      data: {
        name,
        description: description || '',
        location,
        size: parseInt(size),
        price: parseFloat(price),
        amenities: amenities || []
      }
    });

    return NextResponse.json(campingPlace, { status: 201 });
  }
  catch (error) 
  {
    console.error('Error creating camping place:', error);
    return NextResponse.json({ error: 'Failed to create camping place' }, { status: 500 });
  }
}

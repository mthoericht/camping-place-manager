import { NextRequest, NextResponse } from 'next/server';
import { CampingPlaceService } from '@/lib/services/CampingPlaceService';

export async function GET() 
{
  try 
  {
    const campingPlaces = await CampingPlaceService.getCampingPlaces();
    return NextResponse.json(campingPlaces);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching camping places:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch camping places' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) 
{
  try 
  {
    const body = await request.json();
    const { name, description, location, size, price, amenities, isActive } = body;

    if (!name || !location || !size || !price) 
    {
      return NextResponse.json(
        { error: 'Missing required fields: name, location, size, and price are required' },
        { status: 400 }
      );
    }

    const campingPlace = await CampingPlaceService.createCampingPlace({
      name,
      description,
      location,
      size: parseInt(String(size)),
      price: parseFloat(String(price)),
      amenities: amenities || [],
      isActive,
    });

    if (!campingPlace) 
    {
      return NextResponse.json(
        { error: 'Failed to create camping place' },
        { status: 500 }
      );
    }

    return NextResponse.json(campingPlace, { status: 201 });
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error creating camping place:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to create camping place' },
      { status: 500 }
    );
  }
}

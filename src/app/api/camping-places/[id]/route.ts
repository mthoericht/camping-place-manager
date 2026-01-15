import { NextRequest, NextResponse } from 'next/server';
import { CampingPlaceService } from '@/lib/server/services/CampingPlaceService';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try 
  {
    const { id } = await params;
    const campingPlace = await CampingPlaceService.getCampingPlace(id);

    if (!campingPlace) 
    {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 });
    }

    return NextResponse.json(campingPlace);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching camping place:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch camping place' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try 
  {
    const { id } = await params;
    const body = await request.json();
    const { name, description, location, size, price, amenities, isActive } = body;

    const campingPlace = await CampingPlaceService.updateCampingPlace(id, {
      name,
      description,
      location,
      size: size !== undefined ? parseInt(String(size)) : undefined,
      price: price !== undefined ? parseFloat(String(price)) : undefined,
      amenities,
      isActive,
    });

    if (!campingPlace) 
    {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 });
    }

    return NextResponse.json(campingPlace);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error updating camping place:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to update camping place' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    const deleted = await CampingPlaceService.deleteCampingPlace(id);

    if (!deleted) 
    {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Camping place deleted successfully' });
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error deleting camping place:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to delete camping place' },
      { status: 500 }
    );
  }
}

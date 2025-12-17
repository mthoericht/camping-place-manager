import { NextRequest, NextResponse } from 'next/server';
import { CampingItemService } from '@/lib/services/CampingItemService';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    const campingItem = await CampingItemService.getCampingItem(id);

    if (!campingItem) 
    {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    return NextResponse.json(campingItem);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching camping item:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch camping item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    const body = await request.json();
    const { name, category, size, description, isActive } = body;

    const campingItem = await CampingItemService.updateCampingItem(id, {
      name,
      category,
      size: size !== undefined ? parseInt(String(size)) : undefined,
      description,
      isActive,
    });

    if (!campingItem) 
    {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    return NextResponse.json(campingItem);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error updating camping item:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to update camping item' },
      { status: 500 }
    );
  }
}

export async function DELETE(  request: NextRequest,  { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    const deleted = await CampingItemService.deleteCampingItem(id);
    
    if (!deleted) 
    {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Camping item deleted successfully' });
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error deleting camping item:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to delete camping item' },
      { status: 500 }
    );
  }
}

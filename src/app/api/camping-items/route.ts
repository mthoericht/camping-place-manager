import { NextRequest, NextResponse } from 'next/server';
import { CampingItemService } from '@/lib/server/services/CampingItemService';

export async function GET() 
{
  try 
  {
    const campingItems = await CampingItemService.getCampingItems();
    // Filter active items and sort by category
    const activeItems = campingItems
      .filter(item => item.isActive !== false)
      .sort((a, b) => a.category.localeCompare(b.category));
    return NextResponse.json(activeItems);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching camping items:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch camping items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) 
{
  try 
  {
    const body = await request.json();
    const { name, category, size, description, isActive } = body;

    if (!name || !category || !size) 
    {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, and size are required' },
        { status: 400 }
      );
    }

    const campingItem = await CampingItemService.createCampingItem({
      name,
      category,
      size: parseInt(String(size)),
      description,
      isActive,
    });

    if (!campingItem) 
    {
      return NextResponse.json(
        { error: 'Failed to create camping item' },
        { status: 500 }
      );
    }

    return NextResponse.json(campingItem, { status: 201 });
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error creating camping item:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to create camping item' },
      { status: 500 }
    );
  }
}

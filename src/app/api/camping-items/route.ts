import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() 
{
  try 
  {
    const campingItems = await prisma.campingItem.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        category: 'asc'
      }
    });
    return NextResponse.json(campingItems);
  }
  catch (error) 
  {
    console.error('Error fetching camping items:', error);
    return NextResponse.json({ error: 'Failed to fetch camping items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) 
{
  try 
  {
    const body = await request.json();
    const { name, category, size, description } = body;

    if (!name || !category || !size) 
    {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use raw MongoDB insert to avoid replica set requirement
    const insertResult = await prisma.$runCommandRaw({
      insert: 'camping_items',
      documents: [{
        name,
        category,
        size: parseInt(size),
        description: description || '',
        isActive: true,
        createdAt: { $date: new Date().toISOString() },
        updatedAt: { $date: new Date().toISOString() }
      }]
    });

    // Get the inserted document - handle different MongoDB result structures
    const insertedIds = (insertResult as any).insertedIds || (insertResult as any).inserted;
    const insertedId = Array.isArray(insertedIds) ? insertedIds[0] : insertedIds;
    
    const campingItemResult = await prisma.$runCommandRaw({
      find: 'camping_items',
      filter: { _id: insertedId }
    });

    const campingItem = (campingItemResult.cursor as any)?.firstBatch?.[0];
    
    if (!campingItem) 
    {
      return NextResponse.json({ error: 'Failed to retrieve created camping item' }, { status: 500 });
    }

    // Map MongoDB _id to id
    const mappedCampingItem = {
      ...campingItem,
      id: campingItem._id.$oid,
    };

    return NextResponse.json(mappedCampingItem, { status: 201 });
  }
  catch (error) 
  {
    console.error('Error creating camping item:', error);
    return NextResponse.json({ error: 'Failed to create camping item' }, { status: 500 });
  }
}

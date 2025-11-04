import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CampingItemService } from '@/lib/services/CampingItemService';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

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
    console.error('Error fetching camping item:', error);
    return NextResponse.json({ error: 'Failed to fetch camping item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    const body = await request.json();
    const { name, category, size, description, isActive } = body;

    // Use raw MongoDB update to avoid transaction requirements
    const updateData = {
      name,
      category,
      size: parseInt(size),
      description,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: MongoDbHelper.createMongoDate(),// Ensure proper DateTime format
    };

    await prisma.$runCommandRaw({
      update: 'camping_items',
      updates: [
        {
          q: { _id: MongoDbHelper.toObjectId(id) },
          u: { $set: updateData },
        },
      ],
    });

    // Fetch the updated camping item
    const campingItem = await CampingItemService.getCampingItem(id);

    if (!campingItem) 
    {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    return NextResponse.json(campingItem);
  }
  catch (error) 
  {
    console.error('Error updating camping item:', error);
    return NextResponse.json({ error: 'Failed to update camping item' }, { status: 500 });
  }
}

export async function DELETE(  request: NextRequest,  { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    
    // Use raw MongoDB delete to avoid replica set requirement
    const deleteResult = await prisma.$runCommandRaw({
      delete: 'camping_items',
      deletes: [
        {
          q: { _id: MongoDbHelper.toObjectId(id) },
          limit: 1
        }
      ]
    });

    const deletedCount = (deleteResult as any).deletedCount || (deleteResult as any).n;
    
    if (deletedCount === 0) 
    {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Camping item deleted successfully' });
  }
  catch (error) 
  {
    console.error('Error deleting camping item:', error);
    return NextResponse.json({ error: 'Failed to delete camping item' }, { status: 500 });
  }
}

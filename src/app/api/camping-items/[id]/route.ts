import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try {
    const { id } = await params;
    const campingItem = await prisma.campingItem.findUnique({
      where: { id },
    });

    if (!campingItem) {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    return NextResponse.json(campingItem);
  } catch (error) {
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
      updatedAt: { $date: new Date().toISOString() },// Ensure proper DateTime format (Several API routes were using prisma.$runCommandRaw() with new Date() objects, which MongoDB was storing as strings instead of proper DateTime objects.)
    };

    await prisma.$runCommandRaw({
      update: 'camping_items',
      updates: [
        {
          q: { _id: { $oid: id } },
          u: { $set: updateData },
        },
      ],
    });

    // Fetch the updated camping item
    const campingItemResult = await prisma.$runCommandRaw({
      find: 'camping_items',
      filter: { _id: { $oid: id } },
    });

    const campingItem = (campingItemResult.cursor as any)?.firstBatch?.[0];

    if (!campingItem) {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 });
    }

    // Map MongoDB _id to id
    const mappedCampingItem = {
      ...campingItem,
      id: campingItem._id.$oid,
    };

    return NextResponse.json(mappedCampingItem);
  } catch (error) {
    console.error('Error updating camping item:', error);
    return NextResponse.json({ error: 'Failed to update camping item' }, { status: 500 });
  }
}

export async function DELETE(  request: NextRequest,  { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse>
{
  try 
  {
    const { id } = await params;
    await prisma.campingItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Camping item deleted successfully' });
  } catch (error) {
    console.error('Error deleting camping item:', error);
    return NextResponse.json({ error: 'Failed to delete camping item' }, { status: 500 });
  }
}

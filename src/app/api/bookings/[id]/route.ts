import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/BookingService';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
{
  try 
  {
    const { id } = await params;
    const booking = await BookingService.getBooking(id);

    if (!booking) 
    {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching booking:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
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

    const booking = await BookingService.updateBooking(id, {
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      guests: guests !== undefined ? parseInt(String(guests)) : undefined,
      status,
      notes,
      campingItems,
    });

    if (!booking) 
    {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error updating booking:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) 
{
  try 
  {
    const { id } = await params;
    const deleted = await BookingService.deleteBooking(id);

    if (!deleted) 
    {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error deleting booking:', {
      id: (await params).id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage || 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

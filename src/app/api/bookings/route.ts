import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/BookingService';

export async function GET() 
{
  try 
  {
    const bookings = await BookingService.getBookings();
    return NextResponse.json(bookings);
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching bookings:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) 
{
  try 
  {
    const body = await request.json();
    const {
      campingPlaceId,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      guests,
      notes,
      campingItems
    } = body;

    if (!campingPlaceId || !customerName || !customerEmail || !startDate || !endDate || !guests) 
    {
      return NextResponse.json(
        { error: 'Missing required fields: campingPlaceId, customerName, customerEmail, startDate, endDate, and guests are required' },
        { status: 400 }
      );
    }

    const booking = await BookingService.createBooking({
      campingPlaceId,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      guests: parseInt(String(guests)),
      notes,
      campingItems,
    });

    if (!booking) 
    {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json(booking, { status: 201 });
  }
  catch (error) 
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error creating booking:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return specific error message if it's a validation error
    if (errorMessage.includes('exceeds') || errorMessage.includes('not found')) 
    {
      return NextResponse.json(
        { error: errorMessage },
        { status: errorMessage.includes('not found') ? 404 : 400 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

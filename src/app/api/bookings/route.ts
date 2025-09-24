import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        campingPlace: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      campingPlaceId, 
      customerName, 
      customerEmail, 
      customerPhone, 
      startDate, 
      endDate, 
      guests, 
      notes 
    } = body

    if (!campingPlaceId || !customerName || !customerEmail || !startDate || !endDate || !guests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get camping place to calculate price
    const campingPlace = await prisma.campingPlace.findUnique({
      where: { id: campingPlaceId }
    })

    if (!campingPlace) {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 })
    }

    // Calculate total price
    const start = new Date(startDate)
    const end = new Date(endDate)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * campingPlace.price

    const booking = await prisma.booking.create({
      data: {
        campingPlaceId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        startDate: start,
        endDate: end,
        guests: parseInt(guests),
        totalPrice,
        notes: notes || null,
      },
      include: {
        campingPlace: true
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

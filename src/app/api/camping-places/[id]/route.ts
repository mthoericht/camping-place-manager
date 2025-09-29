import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campingPlace = await prisma.campingPlace.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!campingPlace) {
      return NextResponse.json({ error: 'Camping place not found' }, { status: 404 })
    }

    return NextResponse.json(campingPlace)
  } catch (error) {
    console.error('Error fetching camping place:', error)
    return NextResponse.json({ error: 'Failed to fetch camping place' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, location, size, price, amenities, isActive } = body

    const campingPlace = await prisma.campingPlace.update({
      where: { id },
      data: {
        name,
        description,
        location,
        size: parseInt(size),
        price: parseFloat(price),
        amenities: amenities || [],
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    return NextResponse.json(campingPlace)
  } catch (error) {
    console.error('Error updating camping place:', error)
    return NextResponse.json({ error: 'Failed to update camping place' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.campingPlace.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Camping place deleted successfully' })
  } catch (error) {
    console.error('Error deleting camping place:', error)
    return NextResponse.json({ error: 'Failed to delete camping place' }, { status: 500 })
  }
}

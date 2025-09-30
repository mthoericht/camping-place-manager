import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campingItem = await prisma.campingItem.findUnique({
      where: { id }
    })

    if (!campingItem) {
      return NextResponse.json({ error: 'Camping item not found' }, { status: 404 })
    }

    return NextResponse.json(campingItem)
  } catch (error) {
    console.error('Error fetching camping item:', error)
    return NextResponse.json({ error: 'Failed to fetch camping item' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, category, size, description, isActive } = body

    const campingItem = await prisma.campingItem.update({
      where: { id },
      data: {
        name,
        category,
        size: parseInt(size),
        description,
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    return NextResponse.json(campingItem)
  } catch (error) {
    console.error('Error updating camping item:', error)
    return NextResponse.json({ error: 'Failed to update camping item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.campingItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Camping item deleted successfully' })
  } catch (error) {
    console.error('Error deleting camping item:', error)
    return NextResponse.json({ error: 'Failed to delete camping item' }, { status: 500 })
  }
}

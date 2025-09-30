import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const campingItems = await prisma.campingItem.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        category: 'asc'
      }
    })
    return NextResponse.json(campingItems)
  } catch (error) {
    console.error('Error fetching camping items:', error)
    return NextResponse.json({ error: 'Failed to fetch camping items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, size, description } = body

    if (!name || !category || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const campingItem = await prisma.campingItem.create({
      data: {
        name,
        category,
        size: parseInt(size),
        description: description || '',
      }
    })

    return NextResponse.json(campingItem, { status: 201 })
  } catch (error) {
    console.error('Error creating camping item:', error)
    return NextResponse.json({ error: 'Failed to create camping item' }, { status: 500 })
  }
}

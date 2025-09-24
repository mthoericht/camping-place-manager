import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CampingPlaceForm from '@/components/CampingPlaceForm'
import { notFound } from 'next/navigation'

async function getCampingPlace(id: string) {
  try {
    const campingPlace = await prisma.campingPlace.findUnique({
      where: { id }
    })
    return campingPlace
  } catch (error) {
    console.error('Error fetching camping place:', error)
    return null
  }
}

export default async function EditCampingPlacePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campingPlace = await getCampingPlace(id)

  if (!campingPlace) {
    notFound()
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href={`/camping-places/${id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to {campingPlace.name}
          </Link>
        </div>
        
        <CampingPlaceForm initialData={{
          ...campingPlace,
          description: campingPlace.description || undefined
        }} />
      </div>
    </div>
  )
}

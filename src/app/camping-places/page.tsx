import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getCampingPlaces() {
  try {
    const places = await prisma.campingPlace.findMany({
      include: {
        bookings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return places
  } catch (error) {
    console.error('Error fetching camping places:', error)
    return []
  }
}

export default async function CampingPlacesPage() {
  let campingPlaces: Awaited<ReturnType<typeof getCampingPlaces>> = []
  let error: Error | null = null

  try {
    campingPlaces = await getCampingPlaces()
  } catch (err) {
    error = err as Error
    console.error('Error in CampingPlacesPage:', err)
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Camping Places</h1>
        <Link 
          href="/camping-places/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Place
        </Link>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Error</h3>
          <p className="text-gray-600 mb-6">Unable to connect to the database. Please check your MongoDB connection.</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      ) : campingPlaces.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏕️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No camping places yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first camping place</p>
          <Link 
            href="/camping-places/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Place
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campingPlaces.map((place) => (
            <div key={place.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-4xl text-gray-400">🏕️</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{place.name}</h3>
                <p className="text-gray-600 mb-2">{place.location}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{place.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    Capacity: {place.capacity} guests
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ${place.price}/night
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {place.amenities.slice(0, 3).map((amenity, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {place.amenities.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{place.amenities.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {place.bookings.length} bookings
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/camping-places/${place.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/camping-places/${place.id}/edit`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

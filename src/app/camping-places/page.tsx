import Link from 'next/link';
import { CampingPlaceService, CampingPlace } from '@/lib/server/services/CampingPlaceService';
import { PageContainer, PageHeader, EmptyState, ErrorState } from '@/components/ui';

export default async function CampingPlacesPage() 
{
  let campingPlaces: CampingPlace[] = [];
  let error: Error | null = null;

  try 
  {
    campingPlaces = await CampingPlaceService.getCampingPlaces();
  } catch (err) 
  {
    error = err as Error;
    console.error('Error in CampingPlacesPage:', err);
  }

  const cardClass = "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow";
  const amenityBadgeClass = "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full";
  const viewLinkClass = "text-blue-600 hover:text-blue-800 text-sm font-medium";
  const editLinkClass = "text-gray-600 hover:text-gray-800 text-sm font-medium";

  return (
    <PageContainer>
      <PageHeader
        title="Camping Places"
        actionLink={{
          href: '/camping-places/new',
          text: 'Add New Place',
        }}
      />

      {error ? (
        <ErrorState />
      ) : campingPlaces.length === 0 ? (
        <EmptyState
          icon="🏕️"
          title="No camping places yet"
          message="Get started by adding your first camping place"
          actionLink={{
            href: '/camping-places/new',
            text: 'Add Your First Place',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campingPlaces.map((place: CampingPlace) => (
            <div
              key={place.id}
              className={cardClass}
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-4xl text-gray-400">🏕️</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{place.name}</h3>
                <p className="text-gray-600 mb-2">{place.location}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{place.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">Size: {place.size} m²</div>
                  <div className="text-lg font-semibold text-green-600">${place.price}/night</div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {place.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <span
                      key={index}
                      className={amenityBadgeClass}
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
                  <div className="text-sm text-gray-600">{place.bookings?.length || 0} bookings</div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/camping-places/${place.id}`}
                      className={viewLinkClass}
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/camping-places/${place.id}/edit`}
                      className={editLinkClass}
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
    </PageContainer>
  );
}

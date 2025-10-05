import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface CampingItem {
  id: string;
  name: string;
  category: string;
  size: number;
  description: string;
  isActive: boolean;
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

async function getCampingItems(): Promise<CampingItem[]> {
  try 
  {
    const campingItemsResult = await prisma.$runCommandRaw({
      find: 'camping_items',
      sort: { createdAt: -1 }
    });
    
    const campingItems = (campingItemsResult.cursor as any)?.firstBatch || [];
    
    // Map MongoDB _id to id for each camping item
    const mappedCampingItems = campingItems.map((item: any): CampingItem => ({
      ...item,
      id: item._id.$oid
    }));
    
    return mappedCampingItems;
  } catch (error) {
    console.error('Error fetching camping items:', error);
    return [];
  }
}

function formatDate(date: string) 
{
  let dateObj: Date = new Date(date);
  return dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
}

export default async function CampingItemsPage() 
{
  let campingItems: CampingItem[] = [];
  let error: Error | null = null;

  try 
  {
    campingItems = await getCampingItems();
    //console.log(campingItems);
  } catch (err) 
  {
    error = err as Error;
    console.error('Error in CampingItemsPage:', err);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Camping Items</h1>
        <Link
          href="/camping-items/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Item
        </Link>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Error</h3>
          <p className="text-gray-600 mb-6">
            Unable to connect to the database. Please check your MongoDB connection.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      ) : campingItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No camping items yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first camping item</p>
          <Link
            href="/camping-items/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campingItems.map((item: CampingItem) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">Size: {item.size} m²</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    item.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Created: {formatDate(item.createdAt.$date)}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/camping-items/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/camping-items/${item.id}/edit`}
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
  );
}

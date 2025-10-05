import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getCampingItem(id: string) {
  try {
    const campingItemResult = await prisma.$runCommandRaw({
      find: 'camping_items',
      filter: { _id: { $oid: id } },
    });

    const campingItem = (campingItemResult.cursor as any)?.firstBatch?.[0];
    
    if (!campingItem) {
      return null;
    }

    // Map MongoDB _id to id
    return {
      ...campingItem,
      id: campingItem._id.$oid,
    };
  } catch (error) {
    console.error('Error fetching camping item:', error);
    return null;
  }
}

export default async function CampingItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campingItem = await getCampingItem(id);

  if (!campingItem) {
    notFound();
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/camping-items"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Camping Items
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <div className="text-6xl text-gray-400">🎒</div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campingItem.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {campingItem.category}
                  </span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    campingItem.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {campingItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <Link
                href={`/camping-items/${id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Item
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Size</dt>
                    <dd className="text-lg text-gray-900">{campingItem.size} m²</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-lg text-gray-900">{campingItem.category}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-lg text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        campingItem.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {campingItem.isActive ? 'Available' : 'Unavailable'}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-lg text-gray-900">
                      {new Date(campingItem.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-lg text-gray-900">
                      {new Date(campingItem.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div className="prose max-w-none">
                  {campingItem.description ? (
                    <p className="text-gray-700 leading-relaxed">{campingItem.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

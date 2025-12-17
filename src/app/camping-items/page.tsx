import Link from 'next/link';
import { CampingItemService, CampingItem } from '@/lib/services/CampingItemService';
import { DateUtil } from '@/lib/DateUtil';
import { PageContainer, PageHeader, EmptyState, ErrorState } from '@/components/ui';

export default async function CampingItemsPage() 
{
  let campingItems: CampingItem[] = [];
  let error: Error | null = null;

  try 
  {
    campingItems = await CampingItemService.getCampingItems();
  } catch (err) 
  {
    error = err as Error;
    console.error('Error in CampingItemsPage:', err);
  }

  const cardClass = "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow";
  const categoryBadgeClass = "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full";
  const viewLinkClass = "text-blue-600 hover:text-blue-800 text-sm font-medium";
  const editLinkClass = "text-gray-600 hover:text-gray-800 text-sm font-medium";

  return (
    <PageContainer>
      <PageHeader
        title="Camping Items"
        actionLink={{
          href: '/camping-items/new',
          text: 'Add New Item',
        }}
      />

      {error ? (
        <ErrorState />
      ) : campingItems.length === 0 ? (
        <EmptyState
          icon="🎒"
          title="No camping items yet"
          message="Get started by adding your first camping item"
          actionLink={{
            href: '/camping-items/new',
            text: 'Add Your First Item',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campingItems.map((item: CampingItem) => (
            <div
              key={item.id}
              className={cardClass}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">
                  <span className={categoryBadgeClass}>
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
                    Created: {DateUtil.formatDate(item.createdAt)}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/camping-items/${item.id}`}
                      className={viewLinkClass}
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/camping-items/${item.id}/edit`}
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

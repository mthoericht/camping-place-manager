import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import CampingItemForm from '@/components/CampingItemForm';
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

export default async function EditCampingItemPage({
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
            href={`/camping-items/${id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to {campingItem.name}
          </Link>
        </div>

        <CampingItemForm
          initialData={{
            ...campingItem,
            description: campingItem.description || undefined,
          }}
        />
      </div>
    </div>
  );
}

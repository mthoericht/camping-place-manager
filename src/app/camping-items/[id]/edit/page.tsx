import CampingItemForm from '@/components/CampingItemForm';
import { notFound } from 'next/navigation';
import { BackLink, PageContainer } from '@/components/ui';
import { CampingItemService } from '@/lib/services/CampingItemService';

export default async function EditCampingItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campingItem = await CampingItemService.getCampingItem(id);

  if (!campingItem) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <BackLink href={`/camping-items/${id}`} text={`Back to ${campingItem.name}`} />

        <CampingItemForm
          initialData={{
            ...campingItem,
            description: campingItem.description || undefined,
          }}
        />
      </div>
    </PageContainer>
  );
}

import CampingPlaceForm from '@/components/CampingPlaceForm';
import { notFound } from 'next/navigation';
import { BackLink, PageContainer } from '@/components/ui';
import { CampingPlaceService } from '@/lib/server/services/CampingPlaceService';

export default async function EditCampingPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campingPlace = await CampingPlaceService.getCampingPlace(id);

  if (!campingPlace) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <BackLink href={`/camping-places/${id}`} text={`Back to ${campingPlace.name}`} />

        <CampingPlaceForm
          initialData={{
            ...campingPlace,
            description: campingPlace.description || undefined,
          }}
        />
      </div>
    </PageContainer>
  );
}

import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormDialog } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/layout/EmptyState';
import CampingPlaceCard from './components/CampingPlaceCard';
import CampingPlaceFormContent from './components/CampingPlaceFormContent';
import { useCampingPlaceCrud } from './useCampingPlaceCrud';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle';
import { useAppSelector } from '@/store/store';
import { fetchCampingPlaces, deleteCampingPlace, campingPlacesSelectors } from '@/store/campingPlacesSlice';

export default function CampingPlacesPage()
{
  const places = useAppSelector(campingPlacesSelectors.selectAll);
  const campingPlacesStatus = useAppSelector((state) => state.campingPlaces.status);

  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit } = useCampingPlaceCrud();
  const handleDelete = useConfirmDelete(deleteCampingPlace, {
    confirmMessage: 'Stellplatz wirklich löschen?',
    successMessage: 'Stellplatz gelöscht',
    errorMessage: 'Fehler beim Löschen',
  });

  useFetchWhenIdle(() => fetchCampingPlaces(), campingPlacesStatus);

  return (
    <div id="camping-places-page" className="space-y-6">
      <PageHeader title="Stellplätze & Flächen" description="Verwalten Sie alle verfügbaren Plätze">
        <Button id="place-list-add" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neuer Stellplatz</Button>
      </PageHeader>
      <FormDialog {...dialogProps} contentClassName="max-w-2xl">
        <CampingPlaceFormContent campingPlaceId={editing?.id ?? null} form={form} setForm={setForm} onSubmit={handleSubmit} onClose={close} />
      </FormDialog>

      {campingPlacesStatus === 'loading' && <p className="text-muted-foreground">Laden...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => (
          <CampingPlaceCard
            key={place.id}
            place={place}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
        {places.length === 0 && campingPlacesStatus !== 'loading' && (
          <Card className="col-span-full">
            <CardContent><EmptyState icon={<MapPin />} message="Keine Stellplätze vorhanden" /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

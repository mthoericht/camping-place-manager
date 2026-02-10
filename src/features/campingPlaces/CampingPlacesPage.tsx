import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/layout/EmptyState'
import PlaceCard from './components/PlaceCard'
import PlaceFormDialog from './components/PlaceFormDialog'
import { usePlaceCrud } from './usePlaceCrud'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle'
import { useAppSelector } from '@/store/hooks'
import { fetchCampingPlaces, deleteCampingPlace, campingPlacesSelectors } from '@/store/campingPlacesSlice'

export default function CampingPlacesPage()
{
  const places = useAppSelector(campingPlacesSelectors.selectAll)
  const status = useAppSelector((s) => s.campingPlaces.status)

  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit } = usePlaceCrud()
  const handleDelete = useConfirmDelete(deleteCampingPlace, {
    confirmMessage: 'Stellplatz wirklich löschen?',
    successMessage: 'Stellplatz gelöscht',
    errorMessage: 'Fehler beim Löschen',
  })

  useFetchWhenIdle(() => fetchCampingPlaces(), status)

  return (
    <div className="space-y-6">
      <PageHeader title="Stellplätze & Flächen" description="Verwalten Sie alle verfügbaren Plätze">
        <PlaceFormDialog
          dialogProps={dialogProps}
          openCreate={openCreate}
          editing={editing}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={close}
        />
      </PageHeader>

      {status === 'loading' && <p className="text-muted-foreground">Laden...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
        {places.length === 0 && status !== 'loading' && (
          <Card className="col-span-full">
            <CardContent><EmptyState icon={<MapPin />} message="Keine Stellplätze vorhanden" /></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

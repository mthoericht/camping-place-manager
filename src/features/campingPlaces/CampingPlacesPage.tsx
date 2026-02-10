import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/layout/EmptyState'
import PlaceCard from './PlaceCard'
import PlaceFormDialog from './PlaceFormDialog'
import { useCrud } from '@/hooks/useCrud'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle'
import { useAppSelector } from '@/store/hooks'
import { fetchCampingPlaces, createCampingPlace, updateCampingPlace, deleteCampingPlace, campingPlacesSelectors } from '@/store/campingPlacesSlice'
import type { CampingPlaceFormData, CampingPlace } from '@/api/types'

const emptyForm: CampingPlaceFormData = {
  name: '', description: '', location: '', size: 0, price: 0, amenities: '', isActive: true,
}

function placeToForm(place: CampingPlace): CampingPlaceFormData 
{
  return {
    name: place.name,
    description: place.description ?? '',
    location: place.location,
    size: place.size,
    price: place.price,
    amenities: place.amenities,
    isActive: place.isActive,
  }
}

export default function CampingPlacesPage() 
{
  const places = useAppSelector(campingPlacesSelectors.selectAll)
  const status = useAppSelector((s) => s.campingPlaces.status)

  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit } = useCrud({
    emptyForm,
    toForm: placeToForm,
    createThunk: createCampingPlace,
    updateThunk: updateCampingPlace,
    getPayload: (f) => f,
    successCreate: 'Stellplatz erstellt',
    successUpdate: 'Stellplatz aktualisiert',
  })
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

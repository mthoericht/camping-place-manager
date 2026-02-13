import { useCrud } from '@/hooks/useCrud'
import { useSyncEditFormFromStore } from '@/hooks/useSyncEditFormFromStore'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createCampingPlace, updateCampingPlace, campingPlacesSelectors } from '@/store/campingPlacesSlice'
import type { CampingPlaceFormData, CampingPlace } from '@/api/types'

const emptyForm: CampingPlaceFormData = {
  name: '',
  description: '',
  location: '',
  size: 0,
  price: 0,
  amenities: '',
  isActive: true,
}

/** Maps a persisted camping place entity to local form state. */
function campingPlaceToForm(place: CampingPlace): CampingPlaceFormData
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

/**
 * Provides CRUD dialog state and handlers for camping places.
 * Wires Redux thunks into the generic {@link useCrud} hook.
 * Syncs the edit form from the store when the entity is updated via WebSocket or deleted.
 *
 * @returns CRUD state, form data, and submit/open/close handlers.
 */
export function useCampingPlaceCrud()
{
  const dispatch = useAppDispatch()
  const crud = useCrud<CampingPlaceFormData, CampingPlace>({
    emptyForm,
    toForm: campingPlaceToForm,
    buildPayload: (form) => form,
    create: (data) => dispatch(createCampingPlace(data)).unwrap(),
    update: ({ id, data }) => dispatch(updateCampingPlace({ id, data })).unwrap(),
    messages: { create: 'Stellplatz erstellt', update: 'Stellplatz aktualisiert' },
  })

  const { editing, close, setForm } = crud
  const editingId = editing?.id ?? null
  const storeEntity = useAppSelector((state) =>
    editingId != null ? campingPlacesSelectors.selectById(state, editingId) : undefined
  )
  useSyncEditFormFromStore(editing, storeEntity, close, setForm, campingPlaceToForm)

  return crud
}

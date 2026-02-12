import { useCrud } from '@/hooks/useCrud'
import { createCampingPlace, updateCampingPlace } from '@/store/campingPlacesSlice'
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

export function useCampingPlaceCrud()
{
  return useCrud<CampingPlaceFormData, CampingPlace>({
    emptyForm,
    toForm: campingPlaceToForm,
    createThunk: createCampingPlace,
    updateThunk: updateCampingPlace,
    getPayload: (f) => f,
    successCreate: 'Stellplatz erstellt',
    successUpdate: 'Stellplatz aktualisiert',
  })
}

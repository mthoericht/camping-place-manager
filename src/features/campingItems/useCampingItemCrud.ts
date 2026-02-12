import { useCrud } from '@/hooks/useCrud'
import { createCampingItem, updateCampingItem } from '@/store/campingItemsSlice'
import type { CampingItemFormData, CampingItem } from '@/api/types'

const emptyForm: CampingItemFormData = {
  name: '',
  category: 'Tent',
  size: 0,
  description: '',
  isActive: true,
}

function campingItemToForm(item: CampingItem): CampingItemFormData
{
  return {
    name: item.name,
    category: item.category,
    size: item.size,
    description: item.description ?? '',
    isActive: item.isActive,
  }
}

export function useCampingItemCrud()
{
  return useCrud<CampingItemFormData, CampingItem>({
    emptyForm,
    toForm: campingItemToForm,
    createThunk: createCampingItem,
    updateThunk: updateCampingItem,
    getPayload: (f) => f,
    successCreate: 'Camping-Item erstellt',
    successUpdate: 'Camping-Item aktualisiert',
  })
}

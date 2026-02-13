import { useCrud } from '@/hooks/useCrud'
import { useSyncEditFormFromStore } from '@/hooks/useSyncEditFormFromStore'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createCampingItem, updateCampingItem, campingItemsSelectors } from '@/store/campingItemsSlice'
import type { CampingItemFormData, CampingItem } from '@/api/types'

const emptyForm: CampingItemFormData = {
  name: '',
  category: 'Tent',
  size: 0,
  description: '',
  isActive: true,
}

/** Maps a persisted camping item entity to local form state. */
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

/**
 * Provides CRUD dialog state and handlers for camping items.
 * Wires Redux thunks into the generic {@link useCrud} hook.
 * Syncs the edit form from the store when the entity is updated via WebSocket or deleted.
 *
 * @returns CRUD state, form data, and submit/open/close handlers.
 */
export function useCampingItemCrud()
{
  const dispatch = useAppDispatch()
  const crud = useCrud<CampingItemFormData, CampingItem>({
    emptyForm,
    toForm: campingItemToForm,
    buildPayload: (form) => form,
    create: (data) => dispatch(createCampingItem(data)).unwrap(),
    update: ({ id, data }) => dispatch(updateCampingItem({ id, data })).unwrap(),
    messages: { create: 'Camping-Item erstellt', update: 'Camping-Item aktualisiert' },
  })

  const { editing, close, setForm } = crud
  const editingId = editing?.id ?? null
  const storeEntity = useAppSelector((state) => editingId != null ? campingItemsSelectors.selectById(state, editingId) : undefined);
  
  //sync the edit form from the store when the entity is updated via WebSocket or deleted
  useSyncEditFormFromStore(editing, storeEntity, close, setForm, campingItemToForm)

  return crud
}

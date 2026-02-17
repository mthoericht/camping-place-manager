import { useEffect } from 'react';

type EntityWithUpdatedAt = { id: number; updatedAt: string }

/**
 * Syncs the CRUD edit form with the store: closes the dialog if the entity was deleted,
 * or updates the form when the entity was updated (e.g. via WebSocket).
 * Use this in feature CRUD hooks (e.g. useCampingItemCrud, useBookingCrud) after useCrud.
 * @param editing - The current editing entity
 * @param storeEntity - The entity from the store
 * @param close - The function to close the dialog
 * @param setForm - The function to set the form
 * @param toForm - The function to convert the entity to the form
 */
export function useSyncEditFormFromStore<TEntity extends EntityWithUpdatedAt, TForm>(
  editing: TEntity | null,
  storeEntity: TEntity | undefined,
  close: () => void,
  setForm: (form: TForm) => void,
  toForm: (entity: TEntity) => TForm
): void 
{
  useEffect(() => 
  {
    if (!editing) return;
    if (storeEntity === undefined) 
    {
      close();
      return;
    }
    if (storeEntity.updatedAt !== editing.updatedAt) 
    {
      setForm(toForm(storeEntity));
    }
  }, [editing, storeEntity, close, setForm, toForm]);
}

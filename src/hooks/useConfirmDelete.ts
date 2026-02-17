import type { AsyncThunk } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from 'sonner';

/**
 * Options for useConfirmDelete: confirmation prompt and toast messages.
 */
export interface UseConfirmDeleteOptions {
  confirmMessage: string
  successMessage?: string
  errorMessage?: string
}

/**
 * Returns a callback that prompts for confirmation, dispatches the delete thunk, and shows success/error toasts.
 * @param deleteThunk - Async thunk that accepts entity ID and returns the deleted ID
 * @param options - Confirm message and optional success/error toast messages
 * @returns Callback that accepts entity ID and performs the delete flow
 */
export function useConfirmDelete(
  deleteThunk: AsyncThunk<number, number, { rejectValue: string }>,
  options: UseConfirmDeleteOptions
) 
{
  const dispatch = useAppDispatch();
  const { confirmMessage, successMessage = 'Gelöscht', errorMessage = 'Fehler beim Löschen' } = options;

  return useCallback(
    async (id: number) => 
    {
      if (!confirm(confirmMessage)) return;
      try 
      {
        await dispatch(deleteThunk(id)).unwrap();
        toast.success(successMessage);
      }
      catch (err: unknown) 
      {
        const message = err instanceof Error ? err.message : errorMessage;
        toast.error(message);
      }
    },
    [dispatch, deleteThunk, confirmMessage, successMessage, errorMessage]
  );
}

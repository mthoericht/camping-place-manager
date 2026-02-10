import type { AsyncThunk } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { toast } from 'sonner'

export interface UseConfirmDeleteOptions {
  confirmMessage: string
  successMessage?: string
  errorMessage?: string
}

export function useConfirmDelete(
  deleteThunk: AsyncThunk<number, number, object>,
  options: UseConfirmDeleteOptions
) 
{
  const dispatch = useAppDispatch()
  const { confirmMessage, successMessage = 'Gelöscht', errorMessage = 'Fehler beim Löschen' } = options

  return useCallback(
    async (id: number) => 
    {
      if (!confirm(confirmMessage)) return
      try 
      {
        await dispatch(deleteThunk(id)).unwrap()
        toast.success(successMessage)
      }
      catch (err: unknown) 
      {
        const message = err instanceof Error ? err.message : errorMessage
        toast.error(message)
      }
    },
    [dispatch, deleteThunk, confirmMessage, successMessage, errorMessage]
  )
}

import { useCallback } from 'react'
import type React from 'react'
import type { BookingFormData } from '@/api/types'

export function useBookingFormItems(
  setForm: React.Dispatch<React.SetStateAction<BookingFormData>>
): { addItem: (itemId: string) => void; removeItem: (index: number) => void }
{
  const addItem = useCallback((itemId: string) =>
  {
    const id = Number(itemId)
    setForm(prev => ({ ...prev, bookingItems: [...(prev.bookingItems ?? []), { campingItemId: id, quantity: 1 }] }))
  }, [setForm])

  const removeItem = useCallback((index: number) =>
  {
    setForm(prev => ({ ...prev, bookingItems: (prev.bookingItems ?? []).filter((_, i) => i !== index) }))
  }, [setForm])

  return { addItem, removeItem }
}

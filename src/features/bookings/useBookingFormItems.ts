import { useCallback } from 'react'
import type { BookingFormData } from '@/api/types'

export function useBookingFormItems(
  form: BookingFormData,
  setForm: (f: BookingFormData) => void
): { addItem: (itemId: string) => void; removeItem: (index: number) => void }
{
  const addItem = useCallback((itemId: string) =>
  {
    const id = Number(itemId)
    setForm({ ...form, bookingItems: [...form.bookingItems, { campingItemId: id, quantity: 1 }] })
  }, [form, setForm])

  const removeItem = useCallback((index: number) =>
  {
    setForm({ ...form, bookingItems: form.bookingItems.filter((_, i) => i !== index) })
  }, [form, setForm])

  return { addItem, removeItem }
}

import type { BookingFormData, CampingPlace, CampingItem } from '@/api/types'

export function useBookingFormDerived(
  form: BookingFormData,
  places: CampingPlace[],
  items: CampingItem[]
): {
  selectedPlace: CampingPlace | undefined
  totalItemSize: number
  sizeError: string | null
}
{
  const selectedPlace = places.find((p) => p.id === form.campingPlaceId)
  const totalItemSize = form.bookingItems.reduce((s, bi) =>
  {
    const item = items.find((i) => i.id === bi.campingItemId)
    return s + (item?.size ?? 0) * bi.quantity
  }, 0)
  const sizeError = selectedPlace && totalItemSize > selectedPlace.size
    ? `Gesamtfläche (${totalItemSize} m²) überschreitet Stellplatzgröße (${selectedPlace.size} m²)`
    : null

  return { selectedPlace, totalItemSize, sizeError }
}

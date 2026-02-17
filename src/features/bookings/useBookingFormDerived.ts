import type { BookingFormData, CampingPlace, CampingItem } from '@/api/types';

/**
 * Computes the total size (m²) of all booking items by summing each item's size × quantity.
 * @param bookingItems - Array of camping item IDs and quantities
 * @param items - All camping items (used to resolve size per item)
 * @returns Total size in m²
 */
export function calcTotalItemSize(
  bookingItems: Array<{ campingItemId: number; quantity: number }>,
  items: CampingItem[]
): number
{
  return bookingItems.reduce((s, bi) =>
  {
    const item = items.find((i) => i.id === bi.campingItemId);
    return s + (item?.size ?? 0) * bi.quantity;
  }, 0);
}

/**
 * Derives booking form state: selected place, total item size, and size validation error.
 * @param form - Current booking form data
 * @param places - All camping places
 * @param items - All camping items
 * @returns Selected place, total item size, and size error message if total exceeds place size
 */
export function getBookingFormDerived(
  form: BookingFormData,
  places: CampingPlace[],
  items: CampingItem[]
): {
  selectedPlace: CampingPlace | undefined
  totalItemSize: number
  sizeError: string | null
}
{
  const selectedPlace = places.find((p) => p.id === form.campingPlaceId);
  const totalItemSize = calcTotalItemSize(form.bookingItems ?? [], items);
  const sizeError = selectedPlace && totalItemSize > selectedPlace.size
    ? `Gesamtfläche (${totalItemSize} m²) überschreitet Stellplatzgröße (${selectedPlace.size} m²)`
    : null;

  return { selectedPlace, totalItemSize, sizeError };
}

import { useCrud } from '@/hooks/useCrud';
import { useSyncEditFormFromStore } from '@/hooks/useSyncEditFormFromStore';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { createBooking, updateBooking, bookingsSelectors } from '@/store/bookingsSlice';
import { selectActiveCampingPlaces } from '@/store/campingPlacesSlice';
import { selectActiveCampingItems } from '@/store/campingItemsSlice';
import { toDateInputValue } from '@/lib/dateUtils';
import { calcBookingTotalPrice } from '@shared/bookingPrice';
import { calcTotalItemSize } from './useBookingFormDerived';
import type { BookingFormData, Booking, CampingPlace, CampingItem } from '@/api/types';

const emptyForm: BookingFormData = {
  campingPlaceId: 0,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  startDate: '',
  endDate: '',
  guests: 1,
  totalPrice: 0,
  status: 'PENDING',
  notes: '',
  bookingItems: [],
};

/** Maps a persisted booking entity to local form state, converting dates to input-compatible strings. */
function bookingToForm(booking: Booking): BookingFormData
{
  return {
    campingPlaceId: booking.campingPlaceId,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone ?? '',
    startDate: booking.startDate ? toDateInputValue(booking.startDate) : '',
    endDate: booking.endDate ? toDateInputValue(booking.endDate) : '',
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    status: booking.status,
    notes: booking.notes ?? '',
    bookingItems: (booking.bookingItems ?? []).map((bi) => ({ campingItemId: bi.campingItemId, quantity: bi.quantity })),
  };
}

/**
 * Calculates the total booking price based on the date range and the place's daily rate.
 * Returns 0 if no place is provided.
 */
function calcTotalPrice(startDate: string, endDate: string, place: CampingPlace | undefined): number
{
  if (!place) return 0;
  return calcBookingTotalPrice(startDate, endDate, place.price);
}

/**
 * Validates that the total size of booking items does not exceed the selected camping place size.
 * @returns Error message string or null if valid
 */
export function validateBookingFormSize(form: BookingFormData, places: CampingPlace[], items: CampingItem[]): string | null
{
  const place = places.find((p) => p.id === form.campingPlaceId);
  const total = calcTotalItemSize(form.bookingItems ?? [], items);
  if (place && total > place.size)
  {
    return 'Die Gesamtgröße der Items überschreitet die Stellplatzgröße';
  }
  return null;
}

/**
 * Provides CRUD dialog state and handlers for bookings.
 * Wires Redux thunks into the generic {@link useCrud} hook and adds
 * domain-specific logic: automatic total price calculation and
 * validation that booking items do not exceed the camping place size.
 *
 * @returns CRUD state and handlers, plus `places`, `items`, and `calcTotalPrice` for form components.
 */
export function useBookingCrud()
{
  const dispatch = useAppDispatch();
  const places = useAppSelector(selectActiveCampingPlaces);
  const items = useAppSelector(selectActiveCampingItems);

  const crud = useCrud<BookingFormData, Booking, BookingFormData>({
    emptyForm,
    toForm: bookingToForm,
    buildPayload: (form) => ({
      ...form,
      totalPrice: calcTotalPrice(form.startDate ?? '', form.endDate ?? '', places.find((p) => p.id === form.campingPlaceId)),
    }),
    create: (data) => dispatch(createBooking(data)).unwrap(),
    update: ({ id, data }) => dispatch(updateBooking({ id, data })).unwrap(),
    messages: { create: 'Buchung erstellt', update: 'Buchung aktualisiert' },
    validate: (form) => validateBookingFormSize(form, places, items)
  });

  const { editing, close, setForm } = crud;
  const editingId = editing?.id ?? null;
  const storeBooking = useAppSelector((state) =>
    editingId != null ? bookingsSelectors.selectById(state, editingId) : undefined
  );
  //sync the edit form from the store when the entity is updated via WebSocket or deleted
  useSyncEditFormFromStore(editing, storeBooking, close, setForm, bookingToForm);

  return { ...crud, places, items, calcTotalPrice };
}

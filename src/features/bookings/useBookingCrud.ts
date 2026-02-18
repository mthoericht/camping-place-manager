import { useEffect, useMemo, useRef } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { useSyncEditFormFromStore } from '@/hooks/useSyncEditFormFromStore';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { createBooking, updateBooking, bookingsSelectors } from '@/store/bookingsSlice';
import { selectActiveCampingPlaces, campingPlacesSelectors } from '@/store/campingPlacesSlice';
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
 * CRUD state and handlers for the booking dialog. Uses {@link useCrud} with Redux thunks for create/update
 * and adds booking-specific behaviour: total price from dates and place rate, and validation that the
 * total size of booking items does not exceed the selected camping place size.
 *
 * Place list for the form: only active camping places are selectable for new bookings. When editing,
 * the current booking's place is always included so it remains selected even if that place is now inactive.
 * Items list is restricted to active camping items only.
 *
 * @returns CRUD state (editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit),
 *   plus `places` (camping places for the place selector), `items` (active camping items), and `calcTotalPrice`
 *   for use in the booking form.
 */
export function useBookingCrud()
{
  const dispatch = useAppDispatch();
  const activePlaces = useAppSelector(selectActiveCampingPlaces);
  const items = useAppSelector(selectActiveCampingItems);
  const getPlacesRef = useRef<() => CampingPlace[]>(() => activePlaces);

  const crud = useCrud<BookingFormData, Booking, BookingFormData>({
    emptyForm,
    toForm: bookingToForm,
    buildPayload: (form) =>
    {
      const places = getPlacesRef.current();
      return {
        ...form,
        totalPrice: calcTotalPrice(form.startDate ?? '', form.endDate ?? '', places.find((p) => p.id === form.campingPlaceId)),
      };
    },
    create: (data) => dispatch(createBooking(data)).unwrap(),
    update: ({ id, data }) => dispatch(updateBooking({ id, data })).unwrap(),
    messages: { create: 'Buchung erstellt', update: 'Buchung aktualisiert' },
    validate: (form) => validateBookingFormSize(form, getPlacesRef.current(), items),
  });

  const { editing, close, setForm } = crud;
  const editingId = editing?.id ?? null;
  const storeBooking = useAppSelector((state) =>
    editingId != null ? bookingsSelectors.selectById(state, editingId) : undefined
  );
  const currentPlaceId = storeBooking?.campingPlaceId ?? editing?.campingPlaceId ?? null;
  const currentPlaceFromStore = useAppSelector((state) =>  currentPlaceId != null ? campingPlacesSelectors.selectById(state, currentPlaceId) : undefined);

  /** Active places for the selector; when editing, the current booking's place is prepended if it is inactive so it stays selectable. */
  const places = useMemo((): CampingPlace[] =>
  {
    // no editing or current place not in store -> only active places
    if (!currentPlaceId || !currentPlaceFromStore) return activePlaces;
    // currentPlaceId is in activePlaces, so return activePlaces
    if (activePlaces.some((p) => p.id === currentPlaceId)) return activePlaces;

    // currentPlaceId is not in activePlaces, so prepend the current place from store
    return [currentPlaceFromStore, ...activePlaces];
  }, [activePlaces, currentPlaceId, currentPlaceFromStore]);

  useEffect(() => { getPlacesRef.current = () => places; }, [places]);

  useSyncEditFormFromStore(editing, storeBooking, close, setForm, bookingToForm);

  return { ...crud, places, items, calcTotalPrice };
}

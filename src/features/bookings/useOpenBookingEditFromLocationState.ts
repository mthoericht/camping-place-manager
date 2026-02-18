import { useOpenEditFromLocationState } from '@/hooks/useOpenEditFromLocationState';
import type { Booking } from '@/api/types';

const EDIT_BOOKING_STATE_KEY = 'editBooking';

/**
 * Opens the booking edit dialog when the list page was navigated to with a booking in location.state
 * (e.g. from BookingDetailPage "Buchung bearbeiten" → /bookings with dialog open).
 * Uses the generic useOpenEditFromLocationState with stateKey 'editBooking'.
 */
export function useOpenBookingEditFromLocationState(openEdit: (entity: Booking) => void): void
{
  console.log('useOpenBookingEditFromLocationState', openEdit);
  useOpenEditFromLocationState(openEdit, EDIT_BOOKING_STATE_KEY);
}

export { EDIT_BOOKING_STATE_KEY };

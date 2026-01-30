import type { Booking, BookingFormData } from '@/lib/shared/types';
import { createCrudApi } from './createCrudApi';

export type { Booking, BookingFormData };

export const bookingsApi = createCrudApi<Booking, BookingFormData>('/api/bookings', {
  notFoundMessage: 'Booking not found',
});

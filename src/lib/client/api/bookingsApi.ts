import type { Booking, BookingFormData, BookingStatus } from '@/lib/shared/types';
import { createCrudApi } from './createCrudApi';
import { fetchJson } from './http';

export type { Booking, BookingFormData };

const basePath = '/api/bookings';

export const bookingsApi = {
  ...createCrudApi<Booking, BookingFormData>(basePath, {
    notFoundMessage: 'Booking not found',
  }),
  updateStatus(id: string, status: BookingStatus): Promise<Booking> 
  {
    return fetchJson<Booking>(`${basePath}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },
};

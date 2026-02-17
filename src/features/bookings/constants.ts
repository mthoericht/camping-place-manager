import type { BookingStatus } from '@/api/types';

export const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Ausstehend',
  CONFIRMED: 'Bestätigt',
  PAID: 'Bezahlt',
  CANCELLED: 'Storniert',
  COMPLETED: 'Abgeschlossen',
};

export const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-green-500',
  PAID: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-gray-500',
};

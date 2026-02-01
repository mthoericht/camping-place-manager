/**
 * Shared type definitions for the application
 */

/**
 * Common API error response structure
 */
export interface ApiError {
  error: string;
}

/**
 * Base interface for entities with timestamps
 */
export interface BaseEntity {
  id: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Camping Item base interface
 */
export interface CampingItemBase {
  id: string;
  name: string;
  category: string;
  size: number;
  description?: string;
  isActive?: boolean;
}

/**
 * Camping Item with Date timestamps (client-side)
 */
export interface CampingItem extends CampingItemBase {
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Camping Item with string timestamps (server-side)
 */
export interface CampingItemServer extends CampingItemBase {
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Camping Item form data
 */
export interface CampingItemFormData {
  name: string;
  category: string;
  size: number;
  description?: string;
  isActive?: boolean;
}

/**
 * Camping Place base interface
 */
export interface CampingPlaceBase {
  id: string;
  name: string;
  price: number;
  size: number;
  description?: string;
  location?: string;
  amenities?: string[];
  isActive?: boolean;
}

/**
 * Camping Place with Date timestamps (client-side)
 */
export interface CampingPlace extends CampingPlaceBase {
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Camping Place with string timestamps (server-side)
 */
export interface CampingPlaceServer extends CampingPlaceBase {
  description: string;
  location: string;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bookings?: any[];
}

/**
 * Camping Place form data
 */
export interface CampingPlaceFormData {
  name: string;
  description?: string;
  location: string;
  size: number;
  price: number;
  amenities?: string[];
  isActive?: boolean;
}

/**
 * Booking status (matches Prisma enum BookingStatus)
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED';

/**
 * Booking base interface
 */
export interface BookingBase {
  id: string;
  campingPlaceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  guests: number;
  notes?: string;
  totalPrice?: number;
  status?: string;
}

/**
 * Booking with Date timestamps (client-side)
 */
export interface Booking extends BookingBase {
  startDate?: string;
  endDate?: string;
  campingItems?: { [key: string]: number };
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Booking with string timestamps (server-side)
 */
export interface BookingServer extends BookingBase {
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  campingPlace?: {
    id: string;
    name: string;
    location: string;
  };
}

/**
 * Booking form data
 */
export interface BookingFormData {
  campingPlaceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  guests: number;
  notes?: string;
  campingItems?: { [key: string]: number };
}

/**
 * Single status change entry for timeline
 */
export interface BookingStatusChangeEntry {
  status: BookingStatus;
  changedAt: string;
}

/**
 * Booking with detailed information (server-side)
 */
export interface BookingWithDetails extends Omit<BookingServer, 'startDate' | 'endDate'> {
  startDate: string | { $date: string };
  endDate: string | { $date: string };
  statusChanges?: BookingStatusChangeEntry[];
  campingPlace: {
    id: string;
    name: string;
    description: string;
    location: string;
    size: number;
    price: number;
    amenities: string[];
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
  };
  bookingItems?: Array<{
    id: string;
    bookingId: string;
    campingItemId: string;
    quantity: number;
    campingItem?: {
      id: string;
      name: string;
      category: string;
      size: number;
      description: string;
    };
  }>;
}


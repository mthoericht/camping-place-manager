export interface CampingPlace {
  id: number
  name: string
  description: string | null
  location: string
  size: number
  price: number
  amenities: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CampingPlaceFormData {
  name: string
  description?: string
  location: string
  size: number
  price: number
  amenities?: string
  isActive?: boolean
}

export interface CampingItem {
  id: number
  name: string
  category: string
  size: number
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CampingItemFormData {
  name: string
  category: string
  size: number
  description?: string
  isActive?: boolean
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED'

export interface BookingItemData {
  id: number
  bookingId: number
  campingItemId: number
  quantity: number
  campingItem: CampingItem
  createdAt: string
  updatedAt: string
}

export interface BookingStatusChange {
  id: number
  bookingId: number
  status: BookingStatus
  changedAt: string
}

export interface Booking {
  id: number
  campingPlaceId: number
  customerName: string
  customerEmail: string
  customerPhone: string | null
  startDate: string | null
  endDate: string | null
  guests: number
  totalPrice: number
  status: BookingStatus
  notes: string | null
  campingPlace: CampingPlace
  bookingItems: BookingItemData[]
  statusChanges: BookingStatusChange[]
  createdAt: string
  updatedAt: string
}

export interface BookingFormData {
  campingPlaceId: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  startDate?: string
  endDate?: string
  guests: number
  totalPrice?: number
  status?: BookingStatus
  notes?: string
  bookingItems?: Array<{ campingItemId: number; quantity: number }>
}

export interface AnalyticsData {
  totalRevenue: number
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalPlaces: number
  activePlaces: number
  totalItems: number
  activeItems: number
  avgBookingValue: number
  avgGuests: number
  revenueByMonth: Array<{ month: string; revenue: number }>
  bookingsByStatus: Array<{ name: string; value: number; color: string }>
  revenueByPlace: Array<{ name: string; revenue: number; bookings: number }>
  maxDailyRevenue: number
  avgPricePerNight: number
}

export interface Employee {
  id: number
  email: string
  fullName: string
}

export interface AuthResponse {
  token: string
  employee: Employee
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  fullName: string
  password: string
}

import { useCrud } from '@/hooks/useCrud'
import { useAppSelector } from '@/store/hooks'
import { createBooking, updateBooking } from '@/store/bookingsSlice'
import { campingPlacesSelectors } from '@/store/campingPlacesSlice'
import { campingItemsSelectors } from '@/store/campingItemsSlice'
import { toDateInputValue } from '@/lib/dateUtils'
import { calcBookingTotalPrice } from '@shared/bookingPrice'
import type { BookingFormData, Booking, CampingPlace } from '@/api/types'

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
}

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
  }
}

function calcTotalPrice(startDate: string, endDate: string, place: CampingPlace | undefined): number
{
  if (!place) return 0
  return calcBookingTotalPrice(startDate, endDate, place.price)
}

export function useBookingCrud()
{
  const places = useAppSelector(campingPlacesSelectors.selectAll)
  const items = useAppSelector(campingItemsSelectors.selectAll)
  const crud = useCrud<BookingFormData, Booking, BookingFormData>({
    emptyForm,
    toForm: bookingToForm,
    createThunk: createBooking,
    updateThunk: updateBooking,
    getPayload: (f) => ({
      ...f,
      totalPrice: calcTotalPrice(f.startDate ?? '', f.endDate ?? '', places.find((p) => p.id === f.campingPlaceId)),
    }),
    successCreate: 'Buchung erstellt',
    successUpdate: 'Buchung aktualisiert',
    validate: (f) =>
    {
      const place = places.find((p) => p.id === f.campingPlaceId)
      const total = (f.bookingItems ?? []).reduce(
        (s, bi) => s + (items.find((i) => i.id === bi.campingItemId)?.size ?? 0) * bi.quantity,
        0
      )
      return !(place && total > place.size)
    },
  })
  return { ...crud, places, items, calcTotalPrice }
}

import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import * as bookingsApi from '@/api/bookings'
import type { Booking, BookingFormData, BookingStatusChange } from '@/api/types'
import type { RootState } from './store'
import type { LoadingStatus } from './types'

const adapter = createEntityAdapter<Booking>()

export const fetchBookings = createAsyncThunk('bookings/fetchAll', (filters?: Record<string, string>) =>
  bookingsApi.fetchBookings(filters)
)

export const fetchBookingById = createAsyncThunk('bookings/fetchById', (id: number) =>
  bookingsApi.fetchBookingById(id)
)

export const createBooking = createAsyncThunk('bookings/create', (data: BookingFormData) =>
  bookingsApi.createBooking(data)
)

export const updateBooking = createAsyncThunk('bookings/update', ({ id, data }: { id: number; data: Partial<BookingFormData> }) =>
  bookingsApi.updateBooking(id, data)
)

export const deleteBooking = createAsyncThunk('bookings/delete', async (id: number) => 
{
  await bookingsApi.deleteBooking(id)
  return id
})

export const changeBookingStatus = createAsyncThunk('bookings/changeStatus', ({ id, status }: { id: number; status: string }) =>
  bookingsApi.changeBookingStatus(id, status)
)

export const fetchBookingStatusChanges = createAsyncThunk('bookings/fetchStatusChanges', (id: number) =>
  bookingsApi.fetchBookingStatusChanges(id)
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: adapter.getInitialState({
    status: 'idle' as LoadingStatus,
    error: null as string | null,
    statusChanges: {} as Record<number, BookingStatusChange[]>,
  }),
  reducers: {},
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchBookings.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchBookings.fulfilled, (state, action) => { state.status = 'succeeded'; adapter.setAll(state, action.payload) })
      .addCase(fetchBookings.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Fehler' })
      .addCase(fetchBookingById.fulfilled, adapter.upsertOne)
      .addCase(createBooking.fulfilled, adapter.addOne)
      .addCase(updateBooking.fulfilled, adapter.upsertOne)
      .addCase(deleteBooking.fulfilled, (state, action) => 
      {
        adapter.removeOne(state, action.payload)
        delete state.statusChanges[action.payload]
      })
      .addCase(changeBookingStatus.fulfilled, adapter.upsertOne)
      .addCase(fetchBookingStatusChanges.fulfilled, (state, action) => 
      {
        const bookingId = action.meta.arg
        state.statusChanges[bookingId] = action.payload
      })
  },
})

export default bookingsSlice.reducer
export const bookingsSelectors = adapter.getSelectors((state: RootState) => state.bookings)

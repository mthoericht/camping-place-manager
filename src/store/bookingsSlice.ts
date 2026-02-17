import { createSlice, createAsyncThunk, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit';
import * as bookingsApi from '@/api/bookings';
import type { Booking, BookingFormData, BookingStatus, BookingStatusChange, CampingPlace, CampingItem } from '@/api/types';
import type { RootState } from './store';
import type { LoadingStatus } from './types';
import { receiveCampingPlaceFromWebSocket, updateCampingPlace } from './campingPlacesSlice';
import { receiveCampingItemFromWebSocket, updateCampingItem } from './campingItemsSlice';

function updateEmbeddedCampingPlace(state: ReturnType<typeof bookings.getInitialState>, place: CampingPlace)
{
  for (const id of state.ids)
  {
    const booking = state.entities[id];
    if (booking && booking.campingPlaceId === place.id)
    {
      booking.campingPlace = place;
    }
  }
}

function updateEmbeddedCampingItem(state: ReturnType<typeof bookings.getInitialState>, item: CampingItem)
{
  for (const id of state.ids)
  {
    const booking = state.entities[id];
    if (!booking) continue;
    for (const bi of booking.bookingItems)
    {
      if (bi.campingItemId === item.id)
      {
        bi.campingItem = item;
      }
    }
  }
}

const bookings = createEntityAdapter<Booking>();

export const fetchBookings = createAsyncThunk<Booking[], Record<string, string> | undefined, { rejectValue: string }>('bookings/fetchAll', async (filters, { rejectWithValue }) =>
{
  try
  {
    return await bookingsApi.fetchBookings(filters);
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

export const fetchBookingById = createAsyncThunk<Booking, number, { rejectValue: string }>('bookings/fetchById', async (id, { rejectWithValue }) =>
{
  try
  {
    return await bookingsApi.fetchBookingById(id);
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

export const createBooking = createAsyncThunk<Booking, BookingFormData, { rejectValue: string }>('bookings/create', async (data, { rejectWithValue }) =>
{
  try
  {
    return await bookingsApi.createBooking(data);
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

export const updateBooking = createAsyncThunk<Booking, { id: number; data: Partial<BookingFormData> }, { rejectValue: string }>('bookings/update', async ({ id, data }, { rejectWithValue }) =>
{
  try
  {
    return await bookingsApi.updateBooking(id, data);
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

export const deleteBooking = createAsyncThunk<number, number, { rejectValue: string }>('bookings/delete', async (id, { rejectWithValue }) =>
{
  try
  {
    await bookingsApi.deleteBooking(id);
    return id;
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

export const changeBookingStatus = createAsyncThunk<Booking, { id: number; status: BookingStatus }, { rejectValue: string }>('bookings/changeStatus', async ({ id, status }, { rejectWithValue }) =>
{
  try
  {
    return await bookingsApi.changeBookingStatus(id, status);
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

export const fetchBookingStatusChanges = createAsyncThunk<BookingStatusChange[], number, { rejectValue: string }>('bookings/fetchStatusChanges', async (id, { rejectWithValue }) =>
{
  try
  {
    return await bookingsApi.fetchBookingStatusChanges(id);
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
  }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: bookings.getInitialState({
    status: 'idle' as LoadingStatus,
    error: null as string | null,
    mutationError: null as string | null,
    statusChanges: {} as Record<number, BookingStatusChange[]>,
  }),
  reducers: {
    receiveUpserted(state, action: PayloadAction<Booking>)
    {
      bookings.upsertOne(state, action.payload);
    },
    receiveDeleted(state, action: PayloadAction<number>)
    {
      bookings.removeOne(state, action.payload);
      delete state.statusChanges[action.payload];
    },
  },
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchBookings.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, action) => { state.status = 'succeeded'; bookings.setAll(state, action.payload); })
      .addCase(fetchBookings.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Fehler'; })
      .addCase(fetchBookingById.fulfilled, bookings.upsertOne)
      .addCase(createBooking.pending, (state) => { state.mutationError = null; })
      .addCase(createBooking.fulfilled, bookings.addOne)
      .addCase(createBooking.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler'; })
      .addCase(updateBooking.pending, (state) => { state.mutationError = null; })
      .addCase(updateBooking.fulfilled, bookings.upsertOne)
      .addCase(updateBooking.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler'; })
      .addCase(deleteBooking.pending, (state) => { state.mutationError = null; })
      .addCase(deleteBooking.fulfilled, (state, action) => 
      {
        bookings.removeOne(state, action.payload);
        delete state.statusChanges[action.payload];
      })
      .addCase(deleteBooking.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler'; })
      .addCase(changeBookingStatus.pending, (state) => { state.mutationError = null; })
      .addCase(changeBookingStatus.fulfilled, bookings.upsertOne)
      .addCase(changeBookingStatus.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler'; })
      .addCase(fetchBookingStatusChanges.fulfilled, (state, action) => 
      {
        const bookingId = action.meta.arg;
        state.statusChanges[bookingId] = action.payload;
      })
      .addCase(receiveCampingPlaceFromWebSocket, (state, action) =>
      {
        updateEmbeddedCampingPlace(state, action.payload);
      })
      .addCase(updateCampingPlace.fulfilled, (state, action) =>
      {
        updateEmbeddedCampingPlace(state, action.payload);
      })
      .addCase(receiveCampingItemFromWebSocket, (state, action) =>
      {
        updateEmbeddedCampingItem(state, action.payload);
      })
      .addCase(updateCampingItem.fulfilled, (state, action) =>
      {
        updateEmbeddedCampingItem(state, action.payload);
      });
  },
});

export default bookingsSlice.reducer;
export const { receiveUpserted: receiveBookingFromWebSocket, receiveDeleted: receiveBookingDeletedFromWebSocket } = bookingsSlice.actions;
export const bookingsSelectors = bookings.getSelectors((state: RootState) => state.bookings);

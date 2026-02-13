import { createSlice, createAsyncThunk, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit'
import * as campingPlacesApi from '@/api/campingPlaces'
import type { CampingPlace, CampingPlaceFormData } from '@/api/types'
import type { RootState } from './store'
import type { LoadingStatus } from './types'

type UpdateCampingPlaceArg = { id: number; data: Partial<CampingPlaceFormData> };

const campingPlaces = createEntityAdapter<CampingPlace>()

export const fetchCampingPlaces = createAsyncThunk<CampingPlace[], void, { rejectValue: string }>('campingPlaces/fetchAll', async (_, { rejectWithValue }) =>
{
  try
  {
    return await campingPlacesApi.fetchCampingPlaces()
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const fetchCampingPlaceById = createAsyncThunk<CampingPlace, number, { rejectValue: string }>('campingPlaces/fetchById', async (id, { rejectWithValue }) =>
{
  try
  {
    return await campingPlacesApi.fetchCampingPlaceById(id)
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const createCampingPlace = createAsyncThunk<CampingPlace, CampingPlaceFormData, { rejectValue: string }>('campingPlaces/create', async (data, { rejectWithValue }) =>
{
  try
  {
    return await campingPlacesApi.createCampingPlace(data)
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const updateCampingPlace = createAsyncThunk<CampingPlace, UpdateCampingPlaceArg, { rejectValue: string }>('campingPlaces/update', async ({ id, data }, { rejectWithValue }) =>
{
  try
  {
    return await campingPlacesApi.updateCampingPlace(id, data)
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const deleteCampingPlace = createAsyncThunk<number, number, { rejectValue: string }>('campingPlaces/delete', async (id, { rejectWithValue }) =>
{
  try
  {
    await campingPlacesApi.deleteCampingPlace(id)
    return id
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

const campingPlacesSlice = createSlice({
  name: 'campingPlaces',
  initialState: campingPlaces.getInitialState({ status: 'idle' as LoadingStatus, error: null as string | null, mutationError: null as string | null }),
  reducers: {
    receiveUpserted(state, action: PayloadAction<CampingPlace>)
    {
      campingPlaces.upsertOne(state, action.payload)
    },
    receiveDeleted(state, action: PayloadAction<number>)
    {
      campingPlaces.removeOne(state, action.payload)
    },
  },
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchCampingPlaces.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchCampingPlaces.fulfilled, (state, action) => { state.status = 'succeeded'; campingPlaces.setAll(state, action.payload) })
      .addCase(fetchCampingPlaces.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Fehler' })
      .addCase(fetchCampingPlaceById.fulfilled, campingPlaces.upsertOne)
      .addCase(createCampingPlace.pending, (state) => { state.mutationError = null })
      .addCase(createCampingPlace.fulfilled, campingPlaces.addOne)
      .addCase(createCampingPlace.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
      .addCase(updateCampingPlace.pending, (state) => { state.mutationError = null })
      .addCase(updateCampingPlace.fulfilled, campingPlaces.upsertOne)
      .addCase(updateCampingPlace.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
      .addCase(deleteCampingPlace.pending, (state) => { state.mutationError = null })
      .addCase(deleteCampingPlace.fulfilled, campingPlaces.removeOne)
      .addCase(deleteCampingPlace.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
  },
})

export default campingPlacesSlice.reducer
export const { receiveUpserted: receiveCampingPlaceFromWebSocket, receiveDeleted: receiveCampingPlaceDeletedFromWebSocket } = campingPlacesSlice.actions
export const campingPlacesSelectors = campingPlaces.getSelectors((state: RootState) => state.campingPlaces)

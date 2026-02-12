import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import * as campingPlacesApi from '@/api/campingPlaces'
import type { CampingPlace, CampingPlaceFormData } from '@/api/types'
import type { RootState } from './store'
import type { LoadingStatus } from './types'

const adapter = createEntityAdapter<CampingPlace>()

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

export const updateCampingPlace = createAsyncThunk<CampingPlace, { id: number; data: Partial<CampingPlaceFormData> }, { rejectValue: string }>('campingPlaces/update', async ({ id, data }, { rejectWithValue }) =>
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
  initialState: adapter.getInitialState({ status: 'idle' as LoadingStatus, error: null as string | null, mutationError: null as string | null }),
  reducers: {},
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchCampingPlaces.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchCampingPlaces.fulfilled, (state, action) => { state.status = 'succeeded'; adapter.setAll(state, action.payload) })
      .addCase(fetchCampingPlaces.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Fehler' })
      .addCase(fetchCampingPlaceById.fulfilled, adapter.upsertOne)
      .addCase(createCampingPlace.pending, (state) => { state.mutationError = null })
      .addCase(createCampingPlace.fulfilled, adapter.addOne)
      .addCase(createCampingPlace.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
      .addCase(updateCampingPlace.pending, (state) => { state.mutationError = null })
      .addCase(updateCampingPlace.fulfilled, adapter.upsertOne)
      .addCase(updateCampingPlace.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
      .addCase(deleteCampingPlace.pending, (state) => { state.mutationError = null })
      .addCase(deleteCampingPlace.fulfilled, adapter.removeOne)
      .addCase(deleteCampingPlace.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
  },
})

export default campingPlacesSlice.reducer
export const campingPlacesSelectors = adapter.getSelectors((state: RootState) => state.campingPlaces)

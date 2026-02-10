import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import * as campingPlacesApi from '@/api/campingPlaces'
import type { CampingPlace, CampingPlaceFormData } from '@/api/types'
import type { RootState } from './store'

const adapter = createEntityAdapter<CampingPlace>()

export const fetchCampingPlaces = createAsyncThunk('campingPlaces/fetchAll', () =>
  campingPlacesApi.fetchCampingPlaces()
)

export const fetchCampingPlaceById = createAsyncThunk('campingPlaces/fetchById', (id: number) =>
  campingPlacesApi.fetchCampingPlaceById(id)
)

export const createCampingPlace = createAsyncThunk('campingPlaces/create', (data: CampingPlaceFormData) =>
  campingPlacesApi.createCampingPlace(data)
)

export const updateCampingPlace = createAsyncThunk('campingPlaces/update', ({ id, data }: { id: number; data: Partial<CampingPlaceFormData> }) =>
  campingPlacesApi.updateCampingPlace(id, data)
)

export const deleteCampingPlace = createAsyncThunk('campingPlaces/delete', async (id: number) => 
{
  await campingPlacesApi.deleteCampingPlace(id)
  return id
})

type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const campingPlacesSlice = createSlice({
  name: 'campingPlaces',
  initialState: adapter.getInitialState({ status: 'idle' as LoadingStatus, error: null as string | null }),
  reducers: {},
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchCampingPlaces.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchCampingPlaces.fulfilled, (state, action) => { state.status = 'succeeded'; adapter.setAll(state, action.payload) })
      .addCase(fetchCampingPlaces.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Fehler' })
      .addCase(fetchCampingPlaceById.fulfilled, adapter.upsertOne)
      .addCase(createCampingPlace.fulfilled, adapter.addOne)
      .addCase(updateCampingPlace.fulfilled, adapter.upsertOne)
      .addCase(deleteCampingPlace.fulfilled, adapter.removeOne)
  },
})

export default campingPlacesSlice.reducer
export const campingPlacesSelectors = adapter.getSelectors((state: RootState) => state.campingPlaces)

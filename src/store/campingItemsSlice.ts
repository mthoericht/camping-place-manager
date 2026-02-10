import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import * as campingItemsApi from '@/api/campingItems'
import type { CampingItem, CampingItemFormData } from '@/api/types'
import type { RootState } from './store'

const adapter = createEntityAdapter<CampingItem>()

export const fetchCampingItems = createAsyncThunk('campingItems/fetchAll', () =>
  campingItemsApi.fetchCampingItems()
)

export const createCampingItem = createAsyncThunk('campingItems/create', (data: CampingItemFormData) =>
  campingItemsApi.createCampingItem(data)
)

export const updateCampingItem = createAsyncThunk('campingItems/update', ({ id, data }: { id: number; data: Partial<CampingItemFormData> }) =>
  campingItemsApi.updateCampingItem(id, data)
)

export const deleteCampingItem = createAsyncThunk('campingItems/delete', async (id: number) => 
{
  await campingItemsApi.deleteCampingItem(id)
  return id
})

type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const campingItemsSlice = createSlice({
  name: 'campingItems',
  initialState: adapter.getInitialState({ status: 'idle' as LoadingStatus, error: null as string | null }),
  reducers: {},
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchCampingItems.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchCampingItems.fulfilled, (state, action) => { state.status = 'succeeded'; adapter.setAll(state, action.payload) })
      .addCase(fetchCampingItems.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Fehler' })
      .addCase(createCampingItem.fulfilled, adapter.addOne)
      .addCase(updateCampingItem.fulfilled, adapter.upsertOne)
      .addCase(deleteCampingItem.fulfilled, adapter.removeOne)
  },
})

export default campingItemsSlice.reducer
export const campingItemsSelectors = adapter.getSelectors((state: RootState) => state.campingItems)

import { createSlice, createAsyncThunk, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit'
import * as campingItemsApi from '@/api/campingItems'
import type { CampingItem, CampingItemFormData } from '@/api/types'
import type { RootState } from './store'
import type { LoadingStatus } from './types'

const adapter = createEntityAdapter<CampingItem>()

export const fetchCampingItems = createAsyncThunk<CampingItem[], void, { rejectValue: string }>('campingItems/fetchAll', async (_, { rejectWithValue }) =>
{
  try
  {
    return await campingItemsApi.fetchCampingItems()
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const createCampingItem = createAsyncThunk<CampingItem, CampingItemFormData, { rejectValue: string }>('campingItems/create', async (data, { rejectWithValue }) =>
{
  try
  {
    return await campingItemsApi.createCampingItem(data)
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const updateCampingItem = createAsyncThunk<CampingItem, { id: number; data: Partial<CampingItemFormData> }, { rejectValue: string }>('campingItems/update', async ({ id, data }, { rejectWithValue }) =>
{
  try
  {
    return await campingItemsApi.updateCampingItem(id, data)
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

export const deleteCampingItem = createAsyncThunk<number, number, { rejectValue: string }>('campingItems/delete', async (id, { rejectWithValue }) =>
{
  try
  {
    await campingItemsApi.deleteCampingItem(id)
    return id
  }
  catch (e)
  {
    return rejectWithValue(e instanceof Error ? e.message : 'Fehler')
  }
})

const campingItemsSlice = createSlice({
  name: 'campingItems',
  initialState: adapter.getInitialState({ status: 'idle' as LoadingStatus, error: null as string | null, mutationError: null as string | null }),
  reducers: {
    receiveUpserted(state, action: PayloadAction<CampingItem>)
    {
      adapter.upsertOne(state, action.payload)
    },
    receiveDeleted(state, action: PayloadAction<number>)
    {
      adapter.removeOne(state, action.payload)
    },
  },
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchCampingItems.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchCampingItems.fulfilled, (state, action) => { state.status = 'succeeded'; adapter.setAll(state, action.payload) })
      .addCase(fetchCampingItems.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Fehler' })
      .addCase(createCampingItem.pending, (state) => { state.mutationError = null })
      .addCase(createCampingItem.fulfilled, adapter.addOne)
      .addCase(createCampingItem.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
      .addCase(updateCampingItem.pending, (state) => { state.mutationError = null })
      .addCase(updateCampingItem.fulfilled, adapter.upsertOne)
      .addCase(updateCampingItem.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
      .addCase(deleteCampingItem.pending, (state) => { state.mutationError = null })
      .addCase(deleteCampingItem.fulfilled, adapter.removeOne)
      .addCase(deleteCampingItem.rejected, (state, action) => { state.mutationError = action.payload ?? 'Fehler' })
  },
})

export default campingItemsSlice.reducer
export const { receiveUpserted: receiveCampingItemFromWebSocket, receiveDeleted: receiveCampingItemDeletedFromWebSocket } = campingItemsSlice.actions
export const campingItemsSelectors = adapter.getSelectors((state: RootState) => state.campingItems)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAnalytics as fetchAnalyticsApi } from '@/api/analytics'
import type { AnalyticsData } from '@/api/types'
import type { LoadingStatus } from './types'

export const fetchAnalytics = createAsyncThunk('analytics/fetch', () =>
  fetchAnalyticsApi()
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null as AnalyticsData | null,
    status: 'idle' as LoadingStatus,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => 
  {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchAnalytics.fulfilled, (state, action) => { state.status = 'succeeded'; state.data = action.payload })
      .addCase(fetchAnalytics.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Fehler' })
  },
})

export default analyticsSlice.reducer

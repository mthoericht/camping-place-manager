import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loginApi, signupApi, getMeApi } from '@/api/auth'
import type { Employee } from '@/api/types'

interface AuthState
{
  employee: Employee | null
  token: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  employee: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null,
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk('auth/login', async (data: { email: string; password: string }) =>
{
  const result = await loginApi(data)
  localStorage.setItem('auth_token', result.token)
  return result
})

export const signup = createAsyncThunk('auth/signup', async (data: { email: string; fullName: string; password: string }) =>
{
  const result = await signupApi(data)
  localStorage.setItem('auth_token', result.token)
  return result
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async () =>
{
  return getMeApi()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state)
    {
      state.employee = null
      state.token = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('auth_token')
    },
    clearError(state)
    {
      state.error = null
    },
  },
  extraReducers: (builder) =>
  {
    builder
      .addCase(login.pending, (state) =>
      {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) =>
      {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.employee = action.payload.employee
      })
      .addCase(login.rejected, (state, action) =>
      {
        state.status = 'failed'
        state.error = action.error.message ?? 'Login fehlgeschlagen'
      })
      .addCase(signup.pending, (state) =>
      {
        state.status = 'loading'
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) =>
      {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.employee = action.payload.employee
      })
      .addCase(signup.rejected, (state, action) =>
      {
        state.status = 'failed'
        state.error = action.error.message ?? 'Registrierung fehlgeschlagen'
      })
      .addCase(fetchMe.fulfilled, (state, action) =>
      {
        state.employee = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchMe.rejected, (state) =>
      {
        state.employee = null
        state.token = null
        state.status = 'idle'
        localStorage.removeItem('auth_token')
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer

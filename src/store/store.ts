import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import campingPlacesReducer from './campingPlacesSlice';
import campingItemsReducer from './campingItemsSlice';
import bookingsReducer from './bookingsSlice';
import analyticsReducer from './analyticsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campingPlaces: campingPlacesReducer,
    campingItems: campingItemsReducer,
    bookings: bookingsReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

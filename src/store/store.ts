import { useDispatch, useSelector } from 'react-redux';
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed dispatch. React-Redux's useDispatch() returns Dispatch<AnyAction>, so thunk actions
 * are not correctly typed. This wrapper returns AppDispatch so async thunks are fully supported.
 * Without: const dispatch = useDispatch() as AppDispatch;
 * With:    const dispatch = useAppDispatch();
 */
export function useAppDispatch(): AppDispatch
{
  return useDispatch();
}

/**
 * Typed selector. useSelector does not know RootState, so without this wrapper the state
 * type must be annotated in every component. Here the state type is bound once.
 * Without: useSelector((state: RootState) => state.campingItems.status);
 * With:    useAppSelector((state) => state.campingItems.status);
 */
export function useAppSelector<T>(selector: (state: RootState) => T): T
{
  return useSelector(selector);
}

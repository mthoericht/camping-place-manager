/**
 * Typed Redux hooks for this app. Wrappers around react-redux's useSelector/useDispatch
 * so we don't have to import RootState/AppDispatch and cast in every component.
 *
 * Without these: useSelector((state: RootState) => ...), useDispatch() as AppDispatch
 * With these:    useAppSelector((state) => ...), useAppDispatch()
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/** Typed dispatch for the app store. */
export function useAppDispatch(): AppDispatch
{
  return useDispatch();
};

/** Typed selector: reads from the app store with full RootState inference. */
export function useAppSelector<T>(selector: (state: RootState) => T): T
{
  return useSelector(selector);
};
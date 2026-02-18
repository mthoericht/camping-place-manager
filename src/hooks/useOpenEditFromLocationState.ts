import { useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Reads an entity from React Router's location.state by key.
 * Returns undefined if state is null, not an object, or the key is missing.
 *
 * @param state - location.state (unknown, e.g. from useLocation()).
 * @param key - Key under which the entity is stored (e.g. 'editBooking').
 * @returns The value at state[key] cast to T, or undefined.
 */
function getEntityFromState<T>(state: unknown, key: string): T | undefined
{
  if (state === null || typeof state !== 'object') return undefined;
  const value = (state as Record<string, unknown>)[key];
  return value as T | undefined;
}

/**
 * If location.state[stateKey] holds an entity, opens its edit dialog and clears state (replace history).
 * Use when navigating from detail → list so the list opens the edit dialog immediately.
 * @param openEdit - Opens the edit dialog for the entity (e.g. from useCrud).
 * @param stateKey - Key in location.state (default: 'editBooking').
 * @example Detail: navigate('/bookings', { state: { editBooking: booking } }); List: useOpenEditFromLocationState(openEdit)
 */
export function useOpenEditFromLocationState<T>(openEdit: (entity: T) => void, stateKey = 'editBooking'): void
{
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() =>
  {
    const entity = getEntityFromState<T>(location.state, stateKey);
    if (entity === undefined) return;

    openEdit(entity);

    const samePathWithoutState = { replace: true, state: {} };
    navigate(location.pathname, samePathWithoutState);
  }, [location, stateKey, openEdit, navigate]);
}

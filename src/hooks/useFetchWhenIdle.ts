import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import type { AppDispatch } from '@/store/store'
import type { LoadingStatus } from '@/store/types'

/**
 * Dispatches the given thunk when the loading status becomes idle.
 * @param thunk - Redux thunk to dispatch
 * @param status - Current loading status; thunk runs when this is 'idle'
 */
export function useFetchWhenIdle(
  thunk: () => unknown,
  status: LoadingStatus
)
{
  const dispatch = useAppDispatch();
  const thunkRef = useRef(thunk);

  useEffect(() => { thunkRef.current = thunk; });

  useEffect(() =>
  {
    if (status === 'idle')
    {
      dispatch(thunkRef.current() as Parameters<AppDispatch>[0]);
    }
  }, [dispatch, status]);
}

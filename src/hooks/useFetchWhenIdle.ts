import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import type { LoadingStatus } from '@/store/types'

export function useFetchWhenIdle(
  getFetchAction: () => unknown,
  status: LoadingStatus
) 
{
  const dispatch = useAppDispatch()

  useEffect(() => 
  {
    if (status === 'idle')
      dispatch(getFetchAction() as Parameters<ReturnType<typeof useAppDispatch>>[0])
  }, [dispatch, getFetchAction, status])
}

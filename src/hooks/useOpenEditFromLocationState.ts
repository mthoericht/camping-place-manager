import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useOpenEditFromLocationState<T>(
  openEdit: (entity: T) => void,
  stateKey = 'editBooking'
)
{
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => 
  {
    const entity = (location.state as Record<string, T> | null)?.[stateKey]
    if (entity)
    {
      openEdit(entity)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, stateKey, openEdit, navigate])
}

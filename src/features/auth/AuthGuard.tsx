import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMe } from '@/store/authSlice'

export default function AuthGuard({ children }: { children: React.ReactNode })
{
  const dispatch = useAppDispatch()
  const { token, employee, status } = useAppSelector((state) => state.auth)

  useEffect(() =>
  {
    if (token && !employee)
    {
      dispatch(fetchMe())
    }
  }, [token, employee, dispatch])

  if (!token) return <Navigate to="/login" replace />

  if (token && !employee && status !== 'failed')
  {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}

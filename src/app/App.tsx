import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useWebSocketSync } from '@/hooks/useWebSocketSync'
import AppRoutes from './routes'

export default function App()
{
  useWebSocketSync()

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  )
}

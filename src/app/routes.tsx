import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import CampingPlacesPage from '@/features/campingPlaces/CampingPlacesPage'
import CampingItemsPage from '@/features/campingItems/CampingItemsPage'
import BookingsPage from '@/features/bookings/BookingsPage'
import BookingDetailPage from '@/features/bookings/BookingDetailPage'
import AnalyticsPage from '@/features/analytics/AnalyticsPage'

export default function AppRoutes() 
{
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/bookings" replace />} />
        <Route path="camping-places" element={<CampingPlacesPage />} />
        <Route path="camping-items" element={<CampingItemsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/bookings" replace />} />
      </Route>
    </Routes>
  )
}

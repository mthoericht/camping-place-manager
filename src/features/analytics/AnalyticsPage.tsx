import { useEffect } from 'react'
import { Euro, Calendar, Tent, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from './components/StatCard'
import RevenueByMonthChart from './components/RevenueByMonthChart'
import BookingsByStatusChart from './components/BookingsByStatusChart'
import RevenueByPlaceChart from './components/RevenueByPlaceChart'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAnalytics } from '@/store/analyticsSlice'

export default function AnalyticsPage()
{
  const dispatch = useAppDispatch()
  const { data, status } = useAppSelector((s) => s.analytics)

  useEffect(() => { dispatch(fetchAnalytics()) }, [dispatch])

  if (status === 'loading' || !data) return <p className="text-muted-foreground">Laden...</p>

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Berichte" description="Übersicht über Umsatz und Auslastung" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Gesamtumsatz" value={`€${data.totalRevenue.toFixed(2)}`} subtitle={`Aus ${data.confirmedBookings} bestätigten Buchungen`} icon={Euro} />
        <StatCard title="Gesamtbuchungen" value={data.totalBookings} subtitle={`${data.pendingBookings} ausstehend`} icon={Calendar} />
        <StatCard title="Stellplätze" value={data.totalPlaces} subtitle={`${data.activePlaces} aktiv`} icon={Tent} />
        <StatCard title="Ausrüstung" value={data.totalItems} subtitle={`${data.activeItems} aktiv`} icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.revenueByMonth.length > 0 && <RevenueByMonthChart data={data.revenueByMonth} />}
        {data.bookingsByStatus.length > 0 && <BookingsByStatusChart data={data.bookingsByStatus} />}
        {data.revenueByPlace.length > 0 && <RevenueByPlaceChart data={data.revenueByPlace} />}
      </div>

      <Card><CardHeader><CardTitle>Zusammenfassung</CardTitle><CardDescription>Detaillierte Statistiken</CardDescription></CardHeader><CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><h4 className="font-semibold mb-2">Durchschnittswerte</h4><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Ø Buchungswert:</span><span className="font-medium">€{data.avgBookingValue.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Ø Gäste/Buchung:</span><span className="font-medium">{data.avgGuests.toFixed(1)}</span></div></div></div>
          <div><h4 className="font-semibold mb-2">Buchungen</h4><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Bestätigt:</span><span className="font-medium">{data.confirmedBookings}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Storniert:</span><span className="font-medium">{data.cancelledBookings}</span></div></div></div>
          <div><h4 className="font-semibold mb-2">Umsatzpotenzial</h4><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Max. Tagesumsatz:</span><span className="font-medium">€{data.maxDailyRevenue.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Ø Preis/Nacht:</span><span className="font-medium">€{data.avgPricePerNight.toFixed(2)}</span></div></div></div>
        </div>
      </CardContent></Card>
    </div>
  )
}

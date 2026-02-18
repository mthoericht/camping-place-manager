import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Package, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { statusLabels, statusColors } from './constants';
import { useBookingDetail } from './useBookingDetail';
import { EDIT_BOOKING_STATE_KEY } from './useOpenBookingEditFromLocationState';
import type { BookingStatus } from '@/api/types';

export default function BookingDetailPage() 
{
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookingId = Number(id);
  const { booking, statusChanges, handleStatusChange } = useBookingDetail(bookingId);

  if (!booking) return <p className="text-muted-foreground">Laden...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-3xl font-bold">{booking.customerName}</h2>
          <p className="text-muted-foreground">{booking.customerEmail}</p>
        </div>
        <Badge className={`ml-auto ${statusColors[booking.status]}`}>{statusLabels[booking.status]}</Badge>
        <Button variant="outline" size="sm" onClick={() => navigate('/bookings', { state: { [EDIT_BOOKING_STATE_KEY]: booking } })}>
          <Pencil className="h-4 w-4 mr-1" />Buchung bearbeiten
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Buchungsdetails</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Check-in</p><p className="text-sm text-muted-foreground">{booking.startDate ? new Date(booking.startDate).toLocaleDateString('de-DE') : '-'}</p></div></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Check-out</p><p className="text-sm text-muted-foreground">{booking.endDate ? new Date(booking.endDate).toLocaleDateString('de-DE') : '-'}</p></div></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Stellplatz</p><p className="text-sm text-muted-foreground">{booking.campingPlace?.name} ({booking.campingPlace?.size} m²)</p></div></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Gäste</p><p className="text-sm text-muted-foreground">{booking.guests}</p></div></div>
            </div>
            <Separator />
            <div className="flex justify-between"><span className="font-medium">Gesamtpreis</span><span className="text-lg font-bold">€{booking.totalPrice.toFixed(2)}</span></div>
            {booking.customerPhone && <div><span className="text-sm text-muted-foreground">Telefon: </span><span className="text-sm">{booking.customerPhone}</span></div>}
            {booking.notes && <div><span className="text-sm text-muted-foreground">Notizen: </span><span className="text-sm">{booking.notes}</span></div>}
            {booking.bookingItems?.length > 0 && (
              <>
                <Separator />
                <div><p className="font-medium flex items-center gap-2 mb-2"><Package className="h-4 w-4" />Camping-Ausrüstung</p>
                  <div className="flex flex-wrap gap-2">{booking.bookingItems.map((bi) => <Badge key={bi.id} variant="secondary">{bi.campingItem?.name} ({bi.campingItem?.size} m²) x{bi.quantity}</Badge>)}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Status ändern</CardTitle></CardHeader>
            <CardContent>
              <Select value={booking.status} onValueChange={(v) => handleStatusChange(v as BookingStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status-Verlauf</CardTitle></CardHeader>
            <CardContent>
              {statusChanges.length > 0 ? (
                <div className="space-y-3">
                  {statusChanges.map((sc) => (
                    <div key={sc.id} className="flex items-center justify-between gap-2 text-sm">
                      <Badge variant="outline">{statusLabels[sc.status] ?? sc.status}</Badge>
                      <span className="text-muted-foreground shrink-0">
                        {new Date(sc.changedAt).toLocaleString('de-DE')}
                        {sc.employee?.fullName ? ` · von ${sc.employee.fullName}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Keine Statusänderungen</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

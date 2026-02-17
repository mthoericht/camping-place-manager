import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Package, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Booking, BookingStatus } from '@/api/types';
import { statusLabels, statusColors } from '../constants';

type StatusLabels = Record<BookingStatus, string>
type StatusColors = Record<BookingStatus, string>

export type BookingCardProps = {
  booking: Booking
  statusLabels: StatusLabels
  statusColors: StatusColors
  onEdit: (booking: Booking) => void
  onDelete: (id: number) => void
}

export default function BookingCard({ booking, statusLabels: labels, statusColors: colors, onEdit, onDelete }: BookingCardProps)
{
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{booking.customerName}</CardTitle><CardDescription>{booking.customerEmail}</CardDescription></div>
          <Badge className={colors[booking.status]}>{labels[booking.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Check-in</p><p className="text-sm text-muted-foreground">{booking.startDate ? new Date(booking.startDate).toLocaleDateString('de-DE') : '-'}</p></div></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Check-out</p><p className="text-sm text-muted-foreground">{booking.endDate ? new Date(booking.endDate).toLocaleDateString('de-DE') : '-'}</p></div></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Stellplatz</p><p className="text-sm text-muted-foreground">{booking.campingPlace?.name}</p></div></div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Gäste / Preis</p><p className="text-sm text-muted-foreground">{booking.guests} / €{booking.totalPrice.toFixed(2)}</p></div></div>
          </div>
          {booking.bookingItems?.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium flex items-center gap-2 mb-2"><Package className="h-4 w-4" />Camping-Ausrüstung</p>
              <div className="flex flex-wrap gap-2">
                {booking.bookingItems.map((bi) => <Badge key={bi.id} variant="secondary" className="text-xs">{bi.campingItem?.name} ({bi.campingItem?.size} m²)</Badge>)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(booking)}><Pencil className="h-4 w-4 mr-1" />Bearbeiten</Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)}><Eye className="h-4 w-4 mr-1" />Details</Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(booking.id)}>Löschen</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

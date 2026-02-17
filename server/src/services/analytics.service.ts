import prisma from '../prisma/client';

export async function getAnalytics() 
{
  const [campingPlaces, bookings, campingItems] = await Promise.all([
    prisma.campingPlace.findMany(),
    prisma.booking.findMany({
      include: { campingPlace: true, bookingItems: { include: { campingItem: true } } },
    }),
    prisma.campingItem.findMany(),
  ]);

  const confirmedStatuses = ['CONFIRMED', 'PAID', 'COMPLETED'];
  const confirmed = bookings.filter((b) => confirmedStatuses.includes(b.status));
  const totalRevenue = confirmed.reduce((s, b) => s + b.totalPrice, 0);
  const avgBookingValue = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;
  const avgGuests = bookings.length > 0 ? bookings.reduce((s, b) => s + b.guests, 0) / bookings.length : 0;

  const revenueByMonth = confirmed.reduce((acc, b) => 
  {
    const d = b.startDate ?? b.createdAt;
    if (!d) return acc;
    const month = new Date(d).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    const existing = acc.find((i) => i.month === month);
    if (existing) existing.revenue += b.totalPrice;
    else acc.push({ month, revenue: b.totalPrice });
    return acc;
  }, [] as Array<{ month: string; revenue: number }>);

  const bookingsByStatus = [
    { name: 'Bestätigt', value: bookings.filter((b) => b.status === 'CONFIRMED').length, color: '#10b981' },
    { name: 'Ausstehend', value: bookings.filter((b) => b.status === 'PENDING').length, color: '#f59e0b' },
    { name: 'Bezahlt', value: bookings.filter((b) => b.status === 'PAID').length, color: '#3b82f6' },
    { name: 'Storniert', value: bookings.filter((b) => b.status === 'CANCELLED').length, color: '#ef4444' },
    { name: 'Abgeschlossen', value: bookings.filter((b) => b.status === 'COMPLETED').length, color: '#6b7280' },
  ].filter((i) => i.value > 0);

  const revenueByPlace = campingPlaces.map((p) => 
  {
    const placeBookings = confirmed.filter((b) => b.campingPlaceId === p.id);
    return { name: p.name, revenue: placeBookings.reduce((s, b) => s + b.totalPrice, 0), bookings: placeBookings.length };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return {
    totalRevenue, totalBookings: bookings.length,
    confirmedBookings: confirmed.length,
    pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
    cancelledBookings: bookings.filter((b) => b.status === 'CANCELLED').length,
    totalPlaces: campingPlaces.length,
    activePlaces: campingPlaces.filter((p) => p.isActive).length,
    totalItems: campingItems.length,
    activeItems: campingItems.filter((i) => i.isActive).length,
    avgBookingValue, avgGuests,
    revenueByMonth, bookingsByStatus, revenueByPlace,
    maxDailyRevenue: campingPlaces.reduce((s, p) => s + p.price, 0),
    avgPricePerNight: campingPlaces.length > 0 ? campingPlaces.reduce((s, p) => s + p.price, 0) / campingPlaces.length : 0,
  };
}

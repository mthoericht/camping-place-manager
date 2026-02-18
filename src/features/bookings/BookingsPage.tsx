import { Calendar, Plus, Search } from 'lucide-react';
import type { BookingStatus } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormDialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/layout/EmptyState';
import BookingCard from './components/BookingCard';
import BookingFormContent from './components/BookingFormContent';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle';
import { useOpenEditFromLocationState } from '@/hooks/useOpenEditFromLocationState';
import { useAppSelector } from '@/store/store';
import { fetchBookings, deleteBooking } from '@/store/bookingsSlice';
import { fetchCampingPlaces, campingPlacesSelectors } from '@/store/campingPlacesSlice';
import { fetchCampingItems } from '@/store/campingItemsSlice';
import { useBookingCrud } from './useBookingCrud';
import { useFilteredBookings } from './useFilteredBookings';
import { BOOKING_STATUSES, statusLabels, statusColors } from './constants';
import { getBookingFormDerived } from './useBookingFormDerived';
import { useBookingFormItems } from './useBookingFormItems';

export default function BookingsPage() 
{
  const { statusFilter, setStatusFilter, placeFilter, setPlaceFilter, searchTerm, setSearchTerm, bookings } = useFilteredBookings();
  const allPlaces = useAppSelector(campingPlacesSelectors.selectAll);
  const bookingsStatus = useAppSelector((state) => state.bookings.status);
  const campingPlacesStatus = useAppSelector((state) => state.campingPlaces.status);
  const campingItemsStatus = useAppSelector((state) => state.campingItems.status);
  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit, places, items, calcTotalPrice } = useBookingCrud();
  const handleDelete = useConfirmDelete(deleteBooking, {
    confirmMessage: 'Buchung wirklich löschen?',
    successMessage: 'Buchung gelöscht',
    errorMessage: 'Fehler beim Löschen',
  });

  useFetchWhenIdle(() => fetchBookings(), bookingsStatus);
  useFetchWhenIdle(() => fetchCampingPlaces(), campingPlacesStatus);
  useFetchWhenIdle(() => fetchCampingItems(), campingItemsStatus);
  useOpenEditFromLocationState(openEdit);

  const { selectedPlace, totalItemSize, sizeError } = getBookingFormDerived(form, places, items);
  const { addItem, removeItem } = useBookingFormItems(setForm);

  return (
    <div className="space-y-6">
      <PageHeader title="Buchungen" description="Verwalten Sie alle Campingplatz-Buchungen">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[12rem] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Name, E-Mail, Telefon…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter || 'all'} onValueChange={(filter) => setStatusFilter(filter === 'all' ? '' : (filter as BookingStatus))}>
            <SelectTrigger className="w-[11rem]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              {BOOKING_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={placeFilter === '' ? 'all' : String(placeFilter)} onValueChange={(v) => setPlaceFilter(v === 'all' ? '' : Number(v))}>
            <SelectTrigger className="w-[14rem]">
              <SelectValue placeholder="Stellplatz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Stellplätze</SelectItem>
              {allPlaces.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}{!p.isActive ? ' (inaktiv)' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
        </div>
      </PageHeader>
      <FormDialog {...dialogProps} contentClassName="max-w-3xl max-h-[90vh] overflow-y-auto">
        <BookingFormContent
          bookingId={editing?.id ?? null}
          form={form}
          setForm={setForm}
          places={places}
          items={items}
          selectedPlace={selectedPlace}
          totalItemSize={totalItemSize}
          sizeError={sizeError}
          addItem={addItem}
          removeItem={removeItem}
          onSubmit={handleSubmit}
          onClose={close}
          calcTotalPrice={calcTotalPrice}
        />
      </FormDialog>

      {bookingsStatus === 'loading' && <p className="text-muted-foreground">Laden...</p>}

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            statusLabels={statusLabels}
            statusColors={statusColors}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
        {bookings.length === 0 && bookingsStatus !== 'loading' && (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Calendar />}
                message={searchTerm.trim() || placeFilter !== '' || statusFilter !== '' ? 'Keine Buchungen passen zu den Filtern' : 'Keine Buchungen vorhanden'}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

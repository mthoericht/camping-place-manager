import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormDialog } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/layout/EmptyState';
import BookingCard from './components/BookingCard';
import BookingFormContent from './components/BookingFormContent';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle';
import { useOpenEditFromLocationState } from '@/hooks/useOpenEditFromLocationState';
import { useAppSelector } from '@/store/store';
import { fetchBookings, deleteBooking, bookingsSelectors } from '@/store/bookingsSlice';
import { fetchCampingPlaces } from '@/store/campingPlacesSlice';
import { fetchCampingItems } from '@/store/campingItemsSlice';
import { useBookingCrud } from './useBookingCrud';
import { statusLabels, statusColors } from './constants';
import { getBookingFormDerived } from './useBookingFormDerived';
import { useBookingFormItems } from './useBookingFormItems';

export default function BookingsPage() 
{
  const bookings = useAppSelector(bookingsSelectors.selectAll);
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
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
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
          <Card><CardContent><EmptyState icon={<Calendar />} message="Keine Buchungen vorhanden" /></CardContent></Card>
        )}
      </div>
    </div>
  );
}

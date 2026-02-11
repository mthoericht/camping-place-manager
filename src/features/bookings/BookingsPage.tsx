import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/layout/EmptyState'
import BookingCard from './components/BookingCard'
import BookingFormDialog from './components/BookingFormDialog'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle'
import { useOpenEditFromLocationState } from '@/hooks/useOpenEditFromLocationState'
import { useAppSelector } from '@/store/hooks'
import { fetchBookings, deleteBooking, bookingsSelectors } from '@/store/bookingsSlice'
import { fetchCampingPlaces, campingPlacesSelectors } from '@/store/campingPlacesSlice'
import { fetchCampingItems, campingItemsSelectors } from '@/store/campingItemsSlice'
import { useBookingCrud } from './useBookingCrud'
import { statusLabels, statusColors } from './constants'
import { getBookingFormDerived } from './useBookingFormDerived'
import { useBookingFormItems } from './useBookingFormItems'

export default function BookingsPage() 
{
  const bookings = useAppSelector(bookingsSelectors.selectAll)
  const bStatus = useAppSelector((s) => s.bookings.status)
  const placesStatus = useAppSelector((s) => s.campingPlaces.status)
  const itemsStatus = useAppSelector((s) => s.campingItems.status)
  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit, places, items, calcTotalPrice } = useBookingCrud()
  const handleDelete = useConfirmDelete(deleteBooking, {
    confirmMessage: 'Buchung wirklich löschen?',
    successMessage: 'Buchung gelöscht',
    errorMessage: 'Fehler beim Löschen',
  })

  useFetchWhenIdle(() => fetchBookings(), bStatus)
  useFetchWhenIdle(() => fetchCampingPlaces(), placesStatus)
  useFetchWhenIdle(() => fetchCampingItems(), itemsStatus)
  useOpenEditFromLocationState(openEdit)

  const { selectedPlace, totalItemSize, sizeError } = getBookingFormDerived(form, places, items)
  const { addItem, removeItem } = useBookingFormItems(setForm)

  return (
    <div className="space-y-6">
      <PageHeader title="Buchungen" description="Verwalten Sie alle Campingplatz-Buchungen">
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
      </PageHeader>
      <BookingFormDialog
        {...dialogProps}
        editing={editing}
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

      {bStatus === 'loading' && <p className="text-muted-foreground">Laden...</p>}

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
        {bookings.length === 0 && bStatus !== 'loading' && (
          <Card><CardContent><EmptyState icon={<Calendar />} message="Keine Buchungen vorhanden" /></CardContent></Card>
        )}
      </div>
    </div>
  )
}

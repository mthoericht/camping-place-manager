import { useEffect } from 'react'
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
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchBookings, deleteBooking, bookingsSelectors } from '@/store/bookingsSlice'
import { fetchCampingPlaces } from '@/store/campingPlacesSlice'
import { fetchCampingItems } from '@/store/campingItemsSlice'
import { useBookingCrud } from './useBookingCrud'
import { statusLabels, statusColors } from './constants'
import { useBookingFormDerived } from './useBookingFormDerived'
import { useBookingFormItems } from './useBookingFormItems'

export default function BookingsPage() 
{
  const dispatch = useAppDispatch()
  const bookings = useAppSelector(bookingsSelectors.selectAll)
  const bStatus = useAppSelector((s) => s.bookings.status)
  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit, places, items, calcTotalPrice } = useBookingCrud()
  const handleDelete = useConfirmDelete(deleteBooking, {
    confirmMessage: 'Buchung wirklich löschen?',
    successMessage: 'Buchung gelöscht',
    errorMessage: 'Fehler beim Löschen',
  })

  useFetchWhenIdle(() => fetchBookings(), bStatus)
  useOpenEditFromLocationState(openEdit)

  useEffect(() => 
  {
    dispatch(fetchCampingPlaces())
    dispatch(fetchCampingItems())
  }, [dispatch])

  const { selectedPlace, totalItemSize, sizeError } = useBookingFormDerived(form, places, items)
  const { addItem, removeItem } = useBookingFormItems(form, setForm)

  return (
    <div className="space-y-6">
      <PageHeader title="Buchungen" description="Verwalten Sie alle Campingplatz-Buchungen">
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
      </PageHeader>
      <BookingFormDialog
        open={dialogProps.open ?? false}
        onOpenChange={(openValue) => (openValue ? openCreate() : close())}
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

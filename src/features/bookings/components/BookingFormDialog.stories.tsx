import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { calcBookingTotalPrice } from '@shared/bookingPrice'
import BookingFormDialog from './BookingFormDialog'
import type { BookingFormData, CampingPlace, CampingItem } from '@/api/types'

const emptyForm: BookingFormData = {
  campingPlaceId: 0,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  startDate: '',
  endDate: '',
  guests: 1,
  totalPrice: 0,
  status: 'PENDING',
  notes: '',
  bookingItems: [],
}

const mockPlaces: CampingPlace[] = [
  { id: 1, name: 'Platz A1', description: null, location: 'Seeufer Nord', size: 80, price: 50, amenities: 'Strom, Wasser', isActive: true, createdAt: '', updatedAt: '' },
  { id: 2, name: 'Platz B2', description: null, location: 'Seeufer Süd', size: 60, price: 40, amenities: 'Strom', isActive: true, createdAt: '', updatedAt: '' },
]

const mockItems: CampingItem[] = [
  { id: 1, name: 'Zelt', category: 'Tent', size: 20, description: null, isActive: true, createdAt: '', updatedAt: '' },
  { id: 2, name: 'Pavillon', category: 'Pavilion', size: 15, description: null, isActive: true, createdAt: '', updatedAt: '' },
]

const filledForm: BookingFormData = {
  campingPlaceId: 1,
  customerName: 'Max Mustermann',
  customerEmail: 'max@beispiel.de',
  customerPhone: '+49 123 456789',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  guests: 4,
  totalPrice: 200,
  status: 'CONFIRMED',
  notes: '',
  bookingItems: [{ campingItemId: 1, quantity: 1 }],
}

function calcTotalPrice(start: string, end: string, place: CampingPlace | undefined): number
{
  if (!place) return 0
  return calcBookingTotalPrice(start, end, place.price)
}

function BookingFormDialogWrapper({ initialForm, editing, defaultOpen }: { initialForm: BookingFormData; editing: { id: number } | null; defaultOpen?: boolean })
{
  const [form, setForm] = useState<BookingFormData>(initialForm)
  const [open, setOpen] = useState(defaultOpen ?? false)
  const selectedPlace = mockPlaces.find((p) => p.id === form.campingPlaceId)
  const totalItemSize = (form.bookingItems ?? []).reduce(
    (s, bi) => s + (mockItems.find((i) => i.id === bi.campingItemId)?.size ?? 0) * bi.quantity,
    0
  )
  const sizeError = selectedPlace && totalItemSize > selectedPlace.size
    ? `Gesamtfläche (${totalItemSize} m²) überschreitet Stellplatzgröße (${selectedPlace.size} m²)`
    : null

  const addItem = useCallback((itemId: string) =>
  {
    const id = Number(itemId)
    setForm((f) => ({ ...f, bookingItems: [...(f.bookingItems ?? []), { campingItemId: id, quantity: 1 }] }))
  }, [])

  const removeItem = useCallback((index: number) =>
  {
    setForm((f) => ({ ...f, bookingItems: (f.bookingItems ?? []).filter((_, i) => i !== index) }))
  }, [])

  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  return (
    <>
      {!defaultOpen && (
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
      )}
      <BookingFormDialog
        open={open}
        onOpenChange={(v) => (v ? openCreate() : setOpen(false))}
        editing={editing}
        form={form}
        setForm={setForm}
        places={mockPlaces}
        items={mockItems}
        selectedPlace={selectedPlace}
        totalItemSize={totalItemSize}
        sizeError={sizeError}
        addItem={addItem}
        removeItem={removeItem}
        onSubmit={(e) => { e.preventDefault(); setOpen(false) }}
        onClose={() => setOpen(false)}
        calcTotalPrice={calcTotalPrice}
      />
    </>
  )
}

const meta = {
  title: 'Features/Bookings/BookingFormDialog',
  component: BookingFormDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof BookingFormDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  render: () => <BookingFormDialogWrapper initialForm={emptyForm} editing={null} />,
} as unknown as Story

function BookingFormDialogEditWrapper()
{
  const [form, setForm] = useState<BookingFormData>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number } | null>(null)
  const selectedPlace = mockPlaces.find((p) => p.id === form.campingPlaceId)
  const totalItemSize = (form.bookingItems ?? []).reduce(
    (s, bi) => s + (mockItems.find((i) => i.id === bi.campingItemId)?.size ?? 0) * bi.quantity,
    0
  )
  const sizeError = selectedPlace && totalItemSize > selectedPlace.size
    ? `Gesamtfläche (${totalItemSize} m²) überschreitet Stellplatzgröße (${selectedPlace.size} m²)`
    : null
  const addItem = useCallback((itemId: string) =>
  {
    const id = Number(itemId)
    setForm((f) => ({ ...f, bookingItems: [...(f.bookingItems ?? []), { campingItemId: id, quantity: 1 }] }))
  }, [])
  const removeItem = useCallback((index: number) =>
  {
    setForm((f) => ({ ...f, bookingItems: (f.bookingItems ?? []).filter((_, i) => i !== index) }))
  }, [])
  const openEdit = () => { setForm(filledForm); setEditing({ id: 1 }); setOpen(true) }
  return (
    <>
      <Button onClick={openEdit}>Buchung bearbeiten</Button>
      <BookingFormDialog
        open={open}
        onOpenChange={(v) => { if (!v) setOpen(false) }}
        editing={editing}
        form={form}
        setForm={setForm}
        places={mockPlaces}
        items={mockItems}
        selectedPlace={selectedPlace}
        totalItemSize={totalItemSize}
        sizeError={sizeError}
        addItem={addItem}
        removeItem={removeItem}
        onSubmit={(e) => { e.preventDefault(); setOpen(false) }}
        onClose={() => setOpen(false)}
        calcTotalPrice={calcTotalPrice}
      />
    </>
  )
}

export const Edit: Story = {
  render: () => <BookingFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Buchung bearbeiten“ öffnet den Dialog mit ausgefüllten Buchungsdaten.' } } },
} as unknown as Story

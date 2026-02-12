import type { Meta, StoryObj } from '@storybook/react-vite'
import type React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/ui/dialog'
import { calcBookingTotalPrice } from '@shared/bookingPrice'
import BookingFormContent from './BookingFormContent'
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

const formContainerClass = 'max-w-3xl rounded-lg border bg-background p-6 shadow-lg'

/**
 * Holds form state and provides it to BookingFormContent inside a FormDialog.
 * Needed because the form component is controlled (expects form/setForm) and stories
 * supply initial data via props rather than component args.
 */
function BookingFormDialogWrapper({ initialForm, bookingId }: { initialForm: BookingFormData; bookingId: number | null })
{
  const [form, setForm] = useState<BookingFormData>(initialForm)
  const [open, setOpen] = useState(false)
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
      <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
      <FormDialog open={open} onOpenChange={(v) => (v ? openCreate() : setOpen(false))} contentClassName="max-w-3xl max-h-[90vh] overflow-y-auto">
        <BookingFormContent
          bookingId={bookingId}
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
      </FormDialog>
    </>
  )
}

/**
 * Holds form state and syncs it when initialForm changes (e.g. from Storybook controls).
 * Renders BookingFormContent without a dialog so the form is visible directly in the canvas.
 */
function BookingFormContentWrapper({ initialForm, bookingId }: { initialForm: BookingFormData; bookingId: number | null })
{
  const [form, setForm] = useState<BookingFormData>(initialForm)
  useEffect(() => { setForm(initialForm) }, [initialForm])
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

  return (
    <div className={formContainerClass}>
      <BookingFormContent
        bookingId={bookingId}
        form={form}
        setForm={setForm}
        places={mockPlaces}
        items={mockItems}
        selectedPlace={selectedPlace}
        totalItemSize={totalItemSize}
        sizeError={sizeError}
        addItem={addItem}
        removeItem={removeItem}
        onSubmit={(e) => e.preventDefault()}
        onClose={() => undefined}
        calcTotalPrice={calcTotalPrice}
      />
    </div>
  )
}

const meta = {
  title: 'Features/Bookings/BookingForm',
  component: BookingFormContent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof BookingFormContent>

export default meta
type Story = StoryObj<typeof meta>
type FormStory = {
  args?: Partial<BookingFormData>
  render?: (args: Partial<BookingFormData>) => React.ReactElement
  parameters?: Story['parameters']
}

export const Create: FormStory = {
  render: () => <BookingFormDialogWrapper initialForm={emptyForm} bookingId={null} />,
}

export const CreateContent: FormStory = {
  render: () => <BookingFormContentWrapper initialForm={emptyForm} bookingId={null} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
}

function BookingFormDialogEditWrapper()
{
  const [form, setForm] = useState<BookingFormData>(emptyForm)
  const [open, setOpen] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
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
  const openEdit = () => { setForm(filledForm); setBookingId(1); setOpen(true) }
  return (
    <>
      <Button onClick={openEdit}>Buchung bearbeiten</Button>
      <FormDialog open={open} onOpenChange={(v) => { if (!v) setOpen(false) }} contentClassName="max-w-3xl max-h-[90vh] overflow-y-auto">
        <BookingFormContent
          bookingId={bookingId}
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
      </FormDialog>
    </>
  )
}

export const Edit: FormStory = {
  render: () => <BookingFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Buchung bearbeiten“ öffnet den Dialog mit ausgefüllten Buchungsdaten.' } } },
}

export const EditContent: FormStory = {
  args: {
    campingPlaceId: filledForm.campingPlaceId,
    customerName: filledForm.customerName,
    customerEmail: filledForm.customerEmail,
    customerPhone: filledForm.customerPhone,
    startDate: filledForm.startDate,
    endDate: filledForm.endDate,
    guests: filledForm.guests,
    totalPrice: filledForm.totalPrice,
    status: filledForm.status,
    notes: filledForm.notes,
  },
  render: (args) =>
  {
    const initialForm: BookingFormData = { ...filledForm, ...args }
    return <BookingFormContentWrapper initialForm={initialForm} bookingId={1} />
  },
  parameters: { docs: { description: { story: 'Formular-Inhalt mit über Controls änderbaren Ausgangsdaten.' } } },
}

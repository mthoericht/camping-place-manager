import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Package, AlertCircle, X } from 'lucide-react'
import type { BookingFormData, BookingStatus, CampingPlace, CampingItem } from '@/api/types'
import { statusLabels } from '../constants'

export type BookingFormDialogProps = {
  dialogProps: { open?: boolean; onOpenChange?: (open: boolean) => void }
  openCreate: () => void
  editing: { id: number } | null
  form: BookingFormData
  setForm: (f: BookingFormData) => void
  places: CampingPlace[]
  items: CampingItem[]
  selectedPlace: CampingPlace | undefined
  totalItemSize: number
  sizeError: string | null
  addItem: (itemId: string) => void
  removeItem: (index: number) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  calcTotalPrice: (start: string, end: string, place: CampingPlace | undefined) => number
}

export default function BookingFormDialog({
  dialogProps,
  openCreate,
  editing,
  form,
  setForm,
  places,
  items,
  selectedPlace,
  totalItemSize,
  sizeError,
  addItem,
  removeItem,
  onSubmit,
  onClose,
  calcTotalPrice,
}: BookingFormDialogProps)
{
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neue Buchung</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Buchung bearbeiten' : 'Neue Buchung erstellen'}</DialogTitle>
            <DialogDescription>{editing ? 'Buchungsdetails anpassen' : 'Geben Sie die Buchungsdetails ein'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Gast Name</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required /></div>
              <div className="space-y-2"><Label>E-Mail</Label><Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Telefon</Label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Anzahl Gäste</Label><Input type="number" min="1" value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) || 1 })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Check-in</Label><Input type="date" value={form.startDate} onChange={(e) => { const v = e.target.value; setForm({ ...form, startDate: v, totalPrice: calcTotalPrice(v, form.endDate, selectedPlace) }) }} required /></div>
              <div className="space-y-2"><Label>Check-out</Label><Input type="date" value={form.endDate} onChange={(e) => { const v = e.target.value; setForm({ ...form, endDate: v, totalPrice: calcTotalPrice(form.startDate, v, selectedPlace) }) }} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stellplatz</Label>
                <Select value={form.campingPlaceId ? String(form.campingPlaceId) : ''} onValueChange={(v) => { const placeId = Number(v); const place = places.find((p) => p.id === placeId); setForm({ ...form, campingPlaceId: placeId, totalPrice: calcTotalPrice(form.startDate, form.endDate, place) }) }}>
                  <SelectTrigger><SelectValue placeholder="Stellplatz wählen" /></SelectTrigger>
                  <SelectContent>{places.filter((p) => p.isActive).map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.size} m²)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gesamtpreis</Label>
                <p className="text-sm font-medium py-2">{selectedPlace && form.startDate && form.endDate ? `€${calcTotalPrice(form.startDate, form.endDate, selectedPlace).toFixed(2)}` : '–'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BookingStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notizen</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            </div>
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Camping-Ausrüstung</Label>
                <span className="text-sm text-muted-foreground">{totalItemSize} m² / {selectedPlace?.size ?? 0} m²</span>
              </div>
              {form.bookingItems.map((bi, idx) =>
              {
                const item = items.find((i) => i.id === bi.campingItemId)
                return (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">{item?.name}</span>
                      <Badge variant="outline" className="text-xs">{item?.size} m²</Badge>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}><X className="h-4 w-4" /></Button>
                  </div>
                )
              })}
              <Select onValueChange={addItem}>
                <SelectTrigger><SelectValue placeholder="Item hinzufügen..." /></SelectTrigger>
                <SelectContent>{items.filter((i) => i.isActive).map((i) => <SelectItem key={i.id} value={String(i.id)}>{i.name} ({i.size} m²)</SelectItem>)}</SelectContent>
              </Select>
              {sizeError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{sizeError}</AlertDescription></Alert>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={!!sizeError}>{editing ? 'Aktualisieren' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

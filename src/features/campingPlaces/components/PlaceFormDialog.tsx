import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { CampingPlaceFormData } from '@/api/types'

export type PlaceFormDialogProps = {
  dialogProps: { open?: boolean; onOpenChange?: (open: boolean) => void }
  openCreate: () => void
  editing: { id: number } | null
  form: CampingPlaceFormData
  setForm: (f: CampingPlaceFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function PlaceFormDialog({
  dialogProps,
  openCreate,
  editing,
  form,
  setForm,
  onSubmit,
  onClose,
}: PlaceFormDialogProps)
{
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neuer Stellplatz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Stellplatz bearbeiten' : 'Neuer Stellplatz'}</DialogTitle>
            <DialogDescription>Geben Sie die Details des Stellplatzes ein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Platz A1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Standort</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="z.B. Seeufer Nord" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Größe (m²)</Label>
                <Input id="size" type="number" min="0" value={form.size} onChange={(e) => setForm({ ...form, size: Number(e.target.value) || 0 })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preis pro Nacht (€)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amenities">Ausstattung (kommagetrennt)</Label>
              <Input id="amenities" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Strom, Wasser, WLAN" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Beschreibung..." rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
              <Label htmlFor="isActive">Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit">{editing ? 'Aktualisieren' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

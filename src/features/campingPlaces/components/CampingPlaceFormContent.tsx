import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { CampingPlaceFormData } from '@/api/types'

export type CampingPlaceFormContentProps = {
  /** Camping place id when editing, or null for create mode. */
  campingPlaceId: number | null
  form: CampingPlaceFormData
  setForm: (f: CampingPlaceFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function CampingPlaceFormContent({
  campingPlaceId,
  form,
  setForm,
  onSubmit,
  onClose,
}: CampingPlaceFormContentProps)
{
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none">{campingPlaceId != null ? 'Stellplatz bearbeiten' : 'Neuer Stellplatz'}</h2>
        <p className="text-sm text-muted-foreground">Geben Sie die Details des Stellplatzes ein</p>
      </div>
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
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">{campingPlaceId != null ? 'Aktualisieren' : 'Erstellen'}</Button>
      </div>
    </form>
  )
}

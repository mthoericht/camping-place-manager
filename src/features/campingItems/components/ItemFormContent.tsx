import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CampingItemFormData } from '@/api/types'
import { categories } from '../constants'

export type ItemFormContentProps = {
  editing: { id: number } | null
  form: CampingItemFormData
  setForm: (f: CampingItemFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ItemFormContent({
  editing,
  form,
  setForm,
  onSubmit,
  onClose,
}: ItemFormContentProps)
{
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none">{editing ? 'Item bearbeiten' : 'Neues Item'}</h2>
        <p className="text-sm text-muted-foreground">Geben Sie die Details des Camping-Items ein</p>
      </div>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Familienzelt" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Größe (m²)</Label>
          <Input id="size" type="number" min="0" value={form.size} onChange={(e) => setForm({ ...form, size: Number(e.target.value) || 0 })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionale Beschreibung" />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="isActive" checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
          <Label htmlFor="isActive">Aktiv</Label>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">{editing ? 'Aktualisieren' : 'Erstellen'}</Button>
      </div>
    </form>
  )
}

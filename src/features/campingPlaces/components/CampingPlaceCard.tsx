import { Tent, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CampingPlace } from '@/api/types'

export type CampingPlaceCardProps = {
  place: CampingPlace
  onEdit: (place: CampingPlace) => void
  onDelete: (id: number) => void
}

export default function CampingPlaceCard({ place, onEdit, onDelete }: CampingPlaceCardProps)
{
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            <div>
              <CardTitle>{place.name}</CardTitle>
              <CardDescription>{place.location}</CardDescription>
            </div>
          </div>
          <Badge className={place.isActive ? 'bg-green-500' : 'bg-gray-500'}>
            {place.isActive ? 'Aktiv' : 'Inaktiv'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Größe:</span><span className="text-sm font-medium">{place.size} m²</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Preis/Nacht:</span><span className="text-sm font-medium">€{place.price.toFixed(2)}</span></div>
          {place.description && <p className="text-sm text-muted-foreground">{place.description}</p>}
          {place.amenities && (
            <div className="flex flex-wrap gap-1">
              {place.amenities.split(',').filter(Boolean).map((a, i) => (
                <Badge key={i} variant="outline" className="text-xs">{a.trim()}</Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(place)} className="flex-1">
              <Pencil className="h-4 w-4 mr-1" />Bearbeiten
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(place.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

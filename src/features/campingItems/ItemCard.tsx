import { Package, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CampingItem } from '@/api/types'
import { categories, getCategoryColor } from './constants'

export type ItemCardProps = {
  item: CampingItem
  onEdit: (item: CampingItem) => void
  onDelete: (id: number) => void
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps)
{
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <div>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </div>
          </div>
          <Badge className={item.isActive ? 'bg-green-500' : 'bg-gray-500'}>
            {item.isActive ? 'Aktiv' : 'Inaktiv'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={getCategoryColor(item.category)}>{categories.find((c) => c.value === item.category)?.label ?? item.category}</Badge>
            <span className="text-sm font-medium">{item.size} m²</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="flex-1">
              <Pencil className="h-4 w-4 mr-1" />Bearbeiten
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

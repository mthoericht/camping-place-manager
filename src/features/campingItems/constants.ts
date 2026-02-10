export const categories = [
  { value: 'Tent', label: 'Zelt' },
  { value: 'Van', label: 'Van' },
  { value: 'Trailer', label: 'Anhänger' },
  { value: 'Pavilion', label: 'Pavillon/Vorzelt' },
  { value: 'Other', label: 'Sonstiges' },
] as const

export function getCategoryColor(cat: string): string
{
  switch (cat)
  {
    case 'Tent': return 'bg-green-500'
    case 'Van': return 'bg-blue-500'
    case 'Trailer': return 'bg-orange-500'
    case 'Pavilion': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

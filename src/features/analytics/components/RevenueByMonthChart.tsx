import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DataPoint = { month: string; revenue: number }

export default function RevenueByMonthChart({ data }: { data: DataPoint[] })
{
  return (
    <Card>
      <CardHeader>
        <CardTitle>Umsatzentwicklung</CardTitle>
        <CardDescription>Monatlicher Umsatz</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => `€${Number(v).toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Umsatz" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

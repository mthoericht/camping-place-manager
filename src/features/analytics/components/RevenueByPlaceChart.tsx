import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DataPoint = { name: string; revenue: number; bookings: number }

export default function RevenueByPlaceChart({ data }: { data: DataPoint[] })
{
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Stellplätze</CardTitle>
        <CardDescription>Nach Umsatz sortiert</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip formatter={(v) => `€${Number(v).toFixed(2)}`} />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Umsatz" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

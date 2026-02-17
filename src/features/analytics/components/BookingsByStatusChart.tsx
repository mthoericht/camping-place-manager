import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = { name: string; value: number; color: string }

export default function BookingsByStatusChart({ data }: { data: DataPoint[] })
{
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buchungsstatus</CardTitle>
        <CardDescription>Verteilung nach Status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

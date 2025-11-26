'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { mockExpenditures, mockSales } from '@/lib/data';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';

export default function FinancialsPage() {
  const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenditure = mockExpenditures.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenditure;

  const combinedData = [...mockSales.map(s => ({ date: format(s.saleDate, 'yyyy-MM'), revenue: s.total, expenditure: 0 })), ...mockExpenditures.map(e => ({ date: format(e.expenditureDate, 'yyyy-MM'), revenue: 0, expenditure: e.amount }))]
    .reduce((acc, record) => {
        const existing = acc.find(item => item.date === record.date);
        if (existing) {
            existing.revenue += record.revenue;
            existing.expenditure += record.expenditure;
        } else {
            acc.push({ ...record });
        }
        return acc;
    }, [] as { date: string; revenue: number; expenditure: number }[])
    .map(d => ({ ...d, profit: d.revenue - d.expenditure }))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="flex flex-col gap-8">
      <CardHeader className="p-0">
        <CardTitle>Financial Report</CardTitle>
        <CardDescription>An overview of your farm's profit and loss.</CardDescription>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Total income from sales"
        />
        <StatsCard
          title="Total Expenditure"
          value={`$${totalExpenditure.toLocaleString()}`}
          icon={<TrendingDown className="h-5 w-5" />}
          description="Total farm expenses"
        />
        <StatsCard
          title="Net Profit"
          value={`$${netProfit.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          description="Revenue minus expenditures"
          className={netProfit > 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Revenue, expenditure, and profit over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedData}>
                    <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    />
                    <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)"
                        }}
                        labelStyle={{
                            color: "hsl(var(--foreground))"
                        }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenditure" name="Expenditure" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--primary))" strokeWidth={2} />
                </ComposedChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
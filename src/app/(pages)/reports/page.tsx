'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Flock } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Tooltip, TooltipProps } from 'recharts';
import { TrendingDown, Scale, Utensils, Loader2 } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { format, differenceInWeeks, addWeeks } from 'date-fns';


const chartConfig = {
  mortality: {
    label: 'Mortality',
    color: 'hsl(var(--chart-1))',
    icon: TrendingDown,
  },
  fcr: {
    label: 'FCR',
    color: 'hsl(var(--chart-2))',
    icon: Utensils,
  },
  averageWeight: {
    label: 'Avg. Weight',
    color: 'hsl(var(--chart-3))',
    icon: Scale,
  },
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                <span className="font-bold text-foreground">
                    {payload[0].payload.date}
                </span>
            </div>
            {payload.map((p, i) => (
                <div key={i} className="flex flex-col space-y-1 text-right">
                    <span className="text-[0.70rem] uppercase text-muted-foreground" style={{color: p.color || (chartConfig as any)[p.dataKey as string]?.color}}>
                        {p.name}
                    </span>
                    <span className="font-bold" style={{color: p.color || (chartConfig as any)[p.dataKey as string]?.color}}>
                        {p.value}{p.name === 'Mortality' ? '%' : p.name === 'Avg. Weight' ? ' kg' : ''}
                    </span>
                </div>
            ))}
          </div>
        </div>
      );
    }
  
    return null;
  };

export default function ReportsPage() {
    const { firestore, user } = useFirebase();
    const [selectedFlockId, setSelectedFlockId] = useState('all');

    const flocksRef = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'flocks');
      }, [firestore, user]);
    const { data: flocks, isLoading } = useCollection<Flock>(flocksRef);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin"/>
            </div>
        )
    }

    const reportData = () => {
        if (selectedFlockId === 'all') {
            return (flocks || [])
                .reduce((acc, flock) => {
                    const date = format(flock.hatchDate.toDate(), 'yyyy-MM');
                    const mortality = flock.initialCount > 0 ? ((flock.initialCount - flock.count) / flock.initialCount) * 100 : 0;
                    const totalWeightGain = flock.count * flock.averageWeight;
                    const fcr = flock.totalFeedConsumed > 0 && totalWeightGain > 0 ? flock.totalFeedConsumed / totalWeightGain : 0;

                    const existing = acc.find(item => item.date === date);
                    if (existing) {
                        existing.flocks.push({ mortality, fcr, averageWeight: flock.averageWeight });
                    } else {
                        acc.push({ date, flocks: [{ mortality, fcr, averageWeight: flock.averageWeight }] });
                    }
                    return acc;
                }, [] as { date: string; flocks: { mortality: number; fcr: number; averageWeight: number }[] }[])
                .map(group => {
                    const totalMortality = group.flocks.reduce((sum, f) => sum + f.mortality, 0);
                    const totalFcr = group.flocks.reduce((sum, f) => sum + f.fcr, 0);
                    const totalAvgWeight = group.flocks.reduce((sum, f) => sum + f.averageWeight, 0);
                    const count = group.flocks.length;
                    return {
                        date: format(new Date(group.date), 'MMM'),
                        mortality: parseFloat((totalMortality / count).toFixed(2)),
                        fcr: parseFloat((totalFcr / count).toFixed(2)),
                        averageWeight: parseFloat((totalAvgWeight / count).toFixed(2)),
                    };
                })
                .sort((a,b) => new Date(`2000-` + a.date + `-01`).getMonth() - new Date(`2000-` + b.date + `-01`).getMonth());
        } else {
            const selectedFlock = flocks?.find(f => f.id === selectedFlockId);
            if (!selectedFlock) return [];

            const hatchDate = selectedFlock.hatchDate.toDate();
            const ageInWeeks = differenceInWeeks(new Date(), hatchDate);
            const weeklyData = [];
            
            for(let i = 1; i <= ageInWeeks; i++) {
                // This is a simplified projection. A real app might have weekly records.
                const weekDate = addWeeks(hatchDate, i);
                const estimatedWeight = selectedFlock.averageWeight * (i/ageInWeeks);
                const estimatedFeed = selectedFlock.totalFeedConsumed * (i/ageInWeeks);
                const estimatedWeightGain = selectedFlock.count * estimatedWeight;
                const estimatedFCR = estimatedFeed > 0 && estimatedWeightGain > 0 ? estimatedFeed / estimatedWeightGain : 0;

                weeklyData.push({
                    date: `Week ${i}`,
                    mortality: selectedFlock.initialCount > 0 ? parseFloat((((selectedFlock.initialCount - selectedFlock.count) / selectedFlock.initialCount) * 100).toFixed(2)) : 0, // Mortality is cumulative, so it's constant weekly for this mock data
                    fcr: parseFloat(estimatedFCR.toFixed(2)),
                    averageWeight: parseFloat(estimatedWeight.toFixed(2)),
                });
            }
            return weeklyData;
        }
    };
    
    const data = reportData();
    const pageTitle = selectedFlockId === 'all' ? 'Overall Farm Performance' : `Flock ${flocks?.find(f => f.id === selectedFlockId)?.breed || ''} Report`;
    const pageDescription = selectedFlockId === 'all' ? 'Monthly averages across all flocks.' : `Weekly performance for flock ${selectedFlockId.substring(0,6)}...`;


  return (
    <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <p className="text-muted-foreground">{pageDescription}</p>
            </div>
            <Select value={selectedFlockId} onValueChange={setSelectedFlockId}>
                <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Select a report view" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Flocks (Monthly)</SelectItem>
                    {flocks?.map(flock => (
                        <SelectItem key={flock.id} value={flock.id}>
                            {flock.breed} ({flock.id.substring(0,6)}...)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Mortality Rate (%)</CardTitle>
                <CardDescription>
                    {selectedFlockId === 'all' ? 'Monthly mortality rate over the last 6 months.' : 'Cumulative mortality rate.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="mortality" fill="var(--color-mortality)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Feed Conversion Ratio (FCR)</CardTitle>
                <CardDescription>
                    {selectedFlockId === 'all' ? 'Efficiency of converting feed into mass.' : 'Weekly FCR projection.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <LineChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis
                            tickLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="fcr" stroke="var(--color-fcr)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Combined view of key performance indicators.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-80 w-full">
                    <LineChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${value}kg`} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickMargin={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line yAxisId="left" type="monotone" dataKey="averageWeight" name="Avg. Weight" stroke="var(--color-averageWeight)" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="fcr" name="FCR" stroke="var(--color-fcr)" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="mortality" name="Mortality" stroke="var(--color-mortality)" strokeWidth={2} strokeDasharray="3 3" />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}

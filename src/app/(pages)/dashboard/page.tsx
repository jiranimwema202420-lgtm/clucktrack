'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { StatsCard } from '@/components/dashboard/stats-card';
import { mockSensorData } from '@/lib/data';
import { Thermometer, Wheat, TrendingUp, Users, HeartPulse, BrainCircuit, ArrowRight, Loader2, TrendingDown, Scale } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Flock } from '@/lib/types';

const flockGrowthData = [
  { name: 'Week 1', weight: 0.18 },
  { name: 'Week 2', weight: 0.45 },
  { name: 'Week 3', weight: 0.9 },
  { name: 'Week 4', weight: 1.5 },
  { name: 'Week 5', weight: 2.1 },
  { name: 'Week 6', weight: 2.8 },
];

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  const flocksRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'flocks');
  }, [firestore, user]);
  const { data: flocks, isLoading } = useCollection<Flock>(flocksRef);
  
  const totalChickens = flocks?.reduce((sum, flock) => sum + flock.count, 0) || 0;
  
  const fcrData = flocks?.map(flock => {
    const totalWeightGain = flock.count * flock.averageWeight;
    if (flock.totalFeedConsumed > 0 && totalWeightGain > 0) {
      return flock.totalFeedConsumed / totalWeightGain;
    }
    return null;
  }).filter(fcr => fcr !== null) as number[] | undefined;

  const avgFCR = fcrData && fcrData.length > 0 ? (fcrData.reduce((a, b) => a + b, 0) / fcrData.length).toFixed(2) : 'N/A';

  const initialCount = flocks?.reduce((sum, flock) => sum + flock.initialCount, 0) || 0;
  const currentCount = flocks?.reduce((sum, flock) => sum + flock.count, 0) || 0;
  const mortalityRate = initialCount > 0 ? (((initialCount - currentCount) / initialCount) * 100).toFixed(2) : '0.00';

  const totalWeight = flocks?.reduce((sum, flock) => sum + (flock.count * flock.averageWeight), 0) || 0;
  const avgWeight = totalChickens > 0 ? (totalWeight / totalChickens).toFixed(2) : '0.00';


  if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin"/>
        </div>
      )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
            title="Avg. Weight"
            value={`${avgWeight} kg`}
            icon={<Scale className="h-5 w-5" />}
            description="Across all flocks"
        />
        <StatsCard
          title="Feed Conversion"
          value={avgFCR}
          icon={<Wheat className="h-5 w-5" />}
          description="Lower is better"
        />
        <StatsCard
          title="Mortality Rate"
          value={`${mortalityRate}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          description="Across all flocks"
        />
        <Link href="/inventory">
            <StatsCard
              title="Total Flock Size"
              value={totalChickens.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              description={`${flocks?.length || 0} active flocks`}
            />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Flock Growth Projection</CardTitle>
              <CardDescription>Average weight gain for Cobb 500 flock.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flockGrowthData}>
                        <XAxis
                        dataKey="name"
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
                        tickFormatter={(value) => `${value} kg`}
                        />
                        <Bar dataKey="weight" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Environmental Control</CardTitle>
                    <CardDescription>Remotely adjust farm conditions.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-medium">Temperature</label>
                            <span className="font-bold text-lg text-primary">{mockSensorData.temperature}°C</span>
                        </div>
                        <Slider defaultValue={[mockSensorData.temperature]} max={40} step={1} />
                    </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-medium">Humidity</label>
                            <span className="font-bold text-lg text-primary">{mockSensorData.humidity}%</span>
                        </div>
                        <Slider defaultValue={[mockSensorData.humidity]} max={100} step={1} />
                    </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-medium">Ventilation (Ammonia)</label>
                            <span className="font-bold text-lg text-primary">{mockSensorData.ammoniaLevel} ppm</span>
                        </div>
                        <Slider defaultValue={[mockSensorData.ammoniaLevel]} max={50} step={1} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Apply Changes</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
       <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="text-primary"/>
                        AI Feed Optimizer
                    </CardTitle>
                    <CardDescription>
                        Analyze consumption patterns and nutrient requirements to get the optimal feed mix for growth and cost-efficiency.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/feed-optimization" className="w-full">
                        <Button variant="outline" className="w-full">
                            Optimize Feed Mix
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartPulse className="text-primary"/>
                        AI Health Predictor
                    </CardTitle>
                    <CardDescription>
                        Use historical and real-time data to forecast potential health issues and receive proactive alerts.
                    </CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Link href="/health-prediction" className="w-full">
                         <Button variant="outline" className="w-full">
                            Predict Health Issues
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
       </div>
    </div>
  );
}

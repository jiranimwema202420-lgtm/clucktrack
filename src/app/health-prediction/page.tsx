
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictHealthIssues, type PredictHealthIssuesOutput } from '@/ai/flows/predict-health-issues';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, HeartPulse, ShieldAlert, CheckCircle, HelpCircle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Flock, SensorData } from '@/lib/types';
import { differenceInWeeks } from 'date-fns';

const formSchema = z.object({
  flockId: z.string().min(1, { message: 'Please select a flock.' }),
  historicalData: z.string().min(10, {
    message: 'Please provide more detail on historical data.',
  }),
  realTimeSensorReadings: z.string().min(10, {
    message: 'Please provide more detail on sensor readings.',
  }),
});

const LOCAL_STORAGE_KEY = 'healthPredictionResult';

export default function HealthPredictionPage() {
  const [result, setResult] = useState<PredictHealthIssuesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const flocksRef = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'flocks');
  }, [firestore, user]);
  const { data: flocks, isLoading: isLoadingFlocks } = useCollection<Flock>(flocksRef);

  const sensorDataRef = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'sensorData'), orderBy('timestamp', 'desc'), limit(1));
  }, [firestore, user]);
  const { data: sensorData, isLoading: isLoadingSensor } = useCollection<SensorData>(sensorDataRef);

  const latestSensorData = sensorData?.[0];

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    } catch (error) {
        console.error("Failed to parse health prediction result from localStorage", error);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flockId: '',
      historicalData: 'Select a flock to populate historical data.',
      realTimeSensorReadings: 'Latest sensor readings will be populated here.',
    },
  });

  const watchFlockId = form.watch('flockId');

  useEffect(() => {
    const selectedFlock = flocks?.find(f => f.id === watchFlockId);
    if (selectedFlock) {
      const ageInWeeks = differenceInWeeks(new Date(), selectedFlock.hatchDate.toDate());
      const mortalityRate = selectedFlock.initialCount > 0 ? ((selectedFlock.initialCount - selectedFlock.count) / selectedFlock.initialCount) * 100 : 0;

      const history = `
- Flock ID: ${selectedFlock.id.substring(0, 8)}
- Breed: ${selectedFlock.breed}
- Type: ${selectedFlock.type}
- Current Age: ${ageInWeeks} weeks
- Current Count: ${selectedFlock.count} (started with ${selectedFlock.initialCount})
- Mortality Rate: ${mortalityRate.toFixed(2)}%
- Notes: Previous cycle had a mild outbreak of Coccidiosis at week 4.
      `.trim();
      form.setValue('historicalData', history);
    }

    if (latestSensorData) {
        const sensorReadings = `
- Temperature: ${latestSensorData.temperature}°C
- Humidity: ${latestSensorData.humidity}%
- Ammonia Level: ${latestSensorData.ammoniaLevel} ppm
- Notes: Water consumption is up 15%. Activity level is slightly reduced.
        `.trim();
        form.setValue('realTimeSensorReadings', sensorReadings);
    }

  }, [watchFlockId, flocks, latestSensorData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const predictionResult = await predictHealthIssues({
        historicalData: values.historicalData,
        realTimeSensorReadings: values.realTimeSensorReadings
      });
      setResult(predictionResult);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(predictionResult));
    } catch (error) {
      console.error('Error predicting health issues:', error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'There was an error processing your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getRiskBadge = (risk: string) => {
    risk = risk.toLowerCase();
    if (risk.includes('high')) return <Badge variant="destructive">High</Badge>;
    if (risk.includes('medium')) return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">Medium</Badge>;
    if (risk.includes('low')) return <Badge variant="secondary">Low</Badge>;
    return <Badge variant="outline">{risk}</Badge>;
  }
  
  const isDataLoading = isLoadingFlocks || isLoadingSensor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>AI Health Predictor</CardTitle>
          <CardDescription>
            Select a flock to analyze its health based on the latest data.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="flockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Flock</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isDataLoading}>
                          <SelectValue placeholder={isDataLoading ? 'Loading flocks...' : 'Select a flock to analyze'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {flocks?.map(flock => (
                          <SelectItem key={flock.id} value={flock.id}>
                            {flock.breed} ({flock.count} birds)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data</FormLabel>
                    <FormControl>
                      <Textarea readOnly placeholder="Flock history will appear here..." {...field} rows={7} className="bg-muted text-muted-foreground text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="realTimeSensorReadings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Real-time Data & Observations</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Latest sensor readings and farm observations..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || isDataLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <HeartPulse className="mr-2 h-4 w-4" />
                    Predict Health Issues
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle>Health Prediction Report</CardTitle>
          <CardDescription>
            Potential health risks and recommendations will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4">AI is checking vital signs...</p>
            </div>
          )}
          {result && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <Activity className="h-4 w-4" />
                <AlertTitle className="font-semibold">Primary Diagnosis</AlertTitle>
                <AlertDescription>
                 {result.diagnosis}
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-semibold flex items-center mb-2"><ShieldAlert className="mr-2 h-5 w-5 text-primary" />Potential Health Issues</h3>
                <div className="space-y-2">
                    <p className="text-sm p-3 bg-secondary rounded-md">{result.potentialHealthIssues}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold flex items-center mb-2"><HelpCircle className="mr-2 h-5 w-5 text-primary" />Risk Levels</h3>
                 <div className="space-y-2">
                    <p className="text-sm p-3 bg-secondary rounded-md">{result.riskLevels}</p>
                 </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Recommendations</AlertTitle>
                <AlertDescription>
                 {result.recommendations}
                </AlertDescription>
              </Alert>

            </div>
          )}
          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <HeartPulse className="h-12 w-12" />
              <p className="mt-4">Select a flock and run the analysis to generate a health prediction report.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, HeartPulse, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  historicalData: z.string().min(10, {
    message: 'Please provide more detail on historical data.',
  }),
  realTimeSensorReadings: z.string().min(10, {
    message: 'Please provide more detail on sensor readings.',
  }),
});

export default function HealthPredictionPage() {
  const [result, setResult] = useState<PredictHealthIssuesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalData: 'Flock ID: FLK-001. Previous cycle had a mild outbreak of Coccidiosis at week 4. Mortality rate was 4%. Feed consumption dipped by 10% during that week.',
      realTimeSensorReadings: 'Temperature: 28°C (2°C above average), Humidity: 75% (10% above average), Ammonia: 25ppm (5ppm above average). Water consumption is up 15%. Activity level is slightly reduced.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const predictionResult = await predictHealthIssues(values);
      setResult(predictionResult);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>AI Health Predictor</CardTitle>
          <CardDescription>
            Input flock data to forecast potential health issues.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Past illnesses, vaccination records, mortality rates..." {...field} rows={5} />
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
                    <FormLabel>Real-time Sensor Readings</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Current temperature, humidity, ammonia levels..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
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
              <p className="mt-4">Fill out the form to generate a health prediction report.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

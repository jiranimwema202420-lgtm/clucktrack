'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { optimizeFeedMix, type OptimizeFeedMixOutput } from '@/ai/flows/optimize-feed-mix';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, FlaskConical, DollarSign, ArrowUp, FileText } from 'lucide-react';

const formSchema = z.object({
  consumptionPatterns: z.string().min(10, {
    message: 'Please provide more detail on consumption patterns.',
  }),
  nutrientRequirements: z.string().min(10, {
    message: 'Please provide more detail on nutrient requirements.',
  }),
  currentFeedMix: z.string().min(10, {
    message: 'Please provide more detail on the current feed mix.',
  }),
  availableIngredients: z.string().min(10, {
    message: 'Please list available ingredients.',
  }),
});

const LOCAL_STORAGE_KEY = 'feedOptimizationResult';

export default function FeedOptimizationPage() {
  const [result, setResult] = useState<OptimizeFeedMixOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    } catch (error) {
      console.error("Failed to parse feed optimization result from localStorage", error);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consumptionPatterns: 'High consumption in the morning, lower in the evening. Increased water intake during hotter periods.',
      nutrientRequirements: 'Protein: 22%, Energy: 3200 kcal/kg, Calcium: 1.0%, Phosphorus: 0.45%.',
      currentFeedMix: 'Corn: 60%, Soybean Meal: 30%, Fish Meal: 5%, Vitamins/Minerals: 5%.',
      availableIngredients: 'Corn, Soybean Meal, Wheat Bran, Rice Polish, Fish Meal, Limestone, Dicalcium Phosphate.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const optimizationResult = await optimizeFeedMix(values);
      setResult(optimizationResult);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(optimizationResult));
    } catch (error) {
      console.error('Error optimizing feed mix:', error);
      toast({
        variant: 'destructive',
        title: 'Optimization Failed',
        description: 'There was an error processing your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>AI Feed Optimizer</CardTitle>
          <CardDescription>
            Provide details about your flock to get an AI-optimized feed mix.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="consumptionPatterns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumption Patterns</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Higher intake in cooler parts of the day..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nutrientRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nutrient Requirements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Protein: 23%, Lysine: 1.2%..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentFeedMix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Feed Mix</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Corn: 55%, Soy: 30%..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableIngredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Ingredients</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List all available ingredients separated by commas." {...field} />
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
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Optimize Feed Mix
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle>Optimization Results</CardTitle>
          <CardDescription>
            The optimized feed mix and analysis will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4">AI is analyzing your data...</p>
            </div>
          )}
          {result && (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center"><FlaskConical className="mr-2 h-5 w-5 text-primary" />Optimized Feed Mix</h3>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{result.optimizedFeedMix}</p>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Rationale</h3>
                    <p className="text-sm text-muted-foreground">{result.rationale}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-accent p-2 rounded-md">
                            <DollarSign className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Est. Cost Savings</p>
                            <p className="font-bold text-lg">{result.estimatedCostSavings}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="bg-accent p-2 rounded-md">
                            <ArrowUp className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Growth Improvement</p>
                            <p className="font-bold text-lg">{result.expectedGrowthImprovement}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Wand2 className="h-12 w-12" />
              <p className="mt-4">Fill out the form to generate an optimized feed mix.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { OptimizeFeedMixOutput } from '@/ai/flows/optimize-feed-mix';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

import {
  Loader2,
  Wand2,
  FlaskConical,
  DollarSign,
  ArrowUp,
  FileText,
} from 'lucide-react';

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

type FormValues = z.infer<typeof formSchema>;

const LOCAL_STORAGE_KEY = 'feedOptimizationResult';

export default function FeedOptimizationPage() {
  const [result, setResult] = useState<OptimizeFeedMixOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (savedResult) {
        setResult(JSON.parse(savedResult) as OptimizeFeedMixOutput);
      }
    } catch (error) {
      console.error(
        'Failed to parse feed optimization result from localStorage:',
        error
      );

      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      consumptionPatterns:
        'High consumption in the morning, lower in the evening. Increased water intake during hotter periods.',

      nutrientRequirements:
        'Protein: 22%, Energy: 3200 kcal/kg, Calcium: 1.0%, Phosphorus: 0.45%.',

      currentFeedMix:
        'Corn: 60%, Soybean Meal: 30%, Fish Meal: 5%, Vitamins/Minerals: 5%.',

      availableIngredients:
        'Corn, Soybean Meal, Wheat Bran, Rice Polish, Fish Meal, Limestone, Dicalcium Phosphate.',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/feed-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      let data: unknown;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Feed optimization server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        const errorData = data as {
          error?: string;
          details?: string;
        };

        throw new Error(
          errorData.details ||
            errorData.error ||
            `Feed optimization failed (${response.status}).`
        );
      }

      const optimizationResult = data as OptimizeFeedMixOutput;

      if (
        !optimizationResult ||
        typeof optimizationResult.optimizedFeedMix !== 'string'
      ) {
        throw new Error(
          'The AI returned an invalid feed optimization result.'
        );
      }

      setResult(optimizationResult);

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(optimizationResult)
      );

      toast({
        title: 'Feed optimization complete',
        description:
          'AI has generated your recommended feed mix successfully.',
      });
    } catch (error) {
      console.error('Error optimizing feed mix:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to generate a feed optimization result.';

      toast({
        variant: 'destructive',
        title: 'Feed optimization failed',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI Feed Optimizer
        </h1>

        <p className="text-muted-foreground">
          Provide details about your flock to get an AI-optimized feed mix.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feed Information</CardTitle>

            <CardDescription>
              Enter the current feeding conditions and available ingredients.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="consumptionPatterns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumption Patterns</FormLabel>

                      <FormControl>
                        <Textarea
                          placeholder="e.g., Higher intake in cooler parts of the day..."
                          className="min-h-[110px]"
                          {...field}
                        />
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
                        <Textarea
                          placeholder="e.g., Protein: 23%, Lysine: 1.2%..."
                          className="min-h-[110px]"
                          {...field}
                        />
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
                        <Textarea
                          placeholder="e.g., Corn: 55%, Soy: 30%..."
                          className="min-h-[110px]"
                          {...field}
                        />
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
                        <Textarea
                          placeholder="List all available ingredients separated by commas."
                          className="min-h-[110px]"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
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
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>

            <CardDescription>
              The optimized feed mix and analysis will appear here.
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[400px]">
            {isLoading && (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />

                <p className="mt-4 font-medium">
                  AI is analyzing your data...
                </p>

                <p className="mt-1 text-sm">
                  This may take a few moments.
                </p>
              </div>
            )}

            {!isLoading && result && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="flex items-center font-semibold">
                    <FlaskConical className="mr-2 h-5 w-5 text-primary" />
                    Optimized Feed Mix
                  </h3>

                  <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.optimizedFeedMix}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="flex items-center font-semibold">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Rationale
                  </h3>

                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.rationale}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-accent p-2">
                      <DollarSign className="h-6 w-6 text-accent-foreground" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Est. Cost Savings
                      </p>

                      <p className="text-lg font-bold">
                        {result.estimatedCostSavings}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-accent p-2">
                      <ArrowUp className="h-6 w-6 text-accent-foreground" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Growth Improvement
                      </p>

                      <p className="text-lg font-bold">
                        {result.expectedGrowthImprovement}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center text-muted-foreground">
                <Wand2 className="h-12 w-12" />

                <p className="mt-4">
                  Fill out the form to generate an optimized feed mix.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

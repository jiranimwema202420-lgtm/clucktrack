'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { answerPoultryQuestion, type PoultryQuestionOutput } from '@/ai/flows/poultry-qa';
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
import { Loader2, Sparkles, Brain } from 'lucide-react';

const formSchema = z.object({
  query: z.string().min(10, {
    message: 'Please ask a more detailed question.',
  }),
});

const LOCAL_STORAGE_KEY = 'poultryQAResult';

export default function PoultryQAPage() {
  const [result, setResult] = useState<PoultryQuestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    } catch (error) {
      console.error("Failed to parse Q&A result from localStorage", error);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: 'What are the best biosecurity measures to prevent the spread of Avian Influenza in a free-range flock?',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const qaResult = await answerPoultryQuestion(values);
      setResult(qaResult);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(qaResult));
    } catch (error) {
      console.error('Error getting answer:', error);
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: 'There was an error processing your question. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Poultry Q&amp;A</CardTitle>
          <CardDescription>
            Ask the AI expert anything about poultry management.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., How can I improve eggshell quality in my layers?"
                        {...field}
                        rows={8}
                      />
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
                    Getting Answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle>AI Answer</CardTitle>
          <CardDescription>
            The AI's response will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] prose prose-sm max-w-none text-muted-foreground">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4">The AI is thinking...</p>
            </div>
          )}
          {result && (
            <div
              className="space-y-4"
              dangerouslySetInnerHTML={{ __html: result.answer.replace(/\n/g, '<br />') }}
            />
          )}
          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="h-12 w-12" />
              <p className="mt-4">Ask a question to get an expert answer from the AI.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

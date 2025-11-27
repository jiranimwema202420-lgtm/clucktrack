'use server';

/**
 * @fileOverview A flow for answering general poultry management questions.
 *
 * - answerPoultryQuestion - A function that handles the question answering process.
 * - PoultryQuestionInput - The input type for the answerPoultryQuestion function.
 * - PoultryQuestionOutput - The return type for the answerPoultryQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PoultryQuestionInputSchema = z.object({
  query: z.string().describe('The farmer\'s question about poultry management.'),
});
export type PoultryQuestionInput = z.infer<typeof PoultryQuestionInputSchema>;

const PoultryQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the farmer\'s question.'),
});
export type PoultryQuestionOutput = z.infer<typeof PoultryQuestionOutputSchema>;

export async function answerPoultryQuestion(input: PoultryQuestionInput): Promise<PoultryQuestionOutput> {
  return poultryQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'poultryQuestionPrompt',
  input: {schema: PoultryQuestionInputSchema},
  output: {schema: PoultryQuestionOutputSchema},
  prompt: `You are an expert consultant in poultry farm management, specializing in sustainable and profitable practices. A farmer has a question. Provide a clear, comprehensive, and actionable answer.

Farmer's Question: {{{query}}}

Your Answer:`,
});

const poultryQuestionFlow = ai.defineFlow(
  {
    name: 'poultryQuestionFlow',
    inputSchema: PoultryQuestionInputSchema,
    outputSchema: PoultryQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

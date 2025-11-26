'use server';

/**
 * @fileOverview A flow for optimizing poultry feed mix based on consumption patterns and nutrient requirements.
 *
 * - optimizeFeedMix - A function that handles the feed mix optimization process.
 * - OptimizeFeedMixInput - The input type for the optimizeFeedMix function.
 * - OptimizeFeedMixOutput - The return type for the optimizeFeedMix function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeFeedMixInputSchema = z.object({
  consumptionPatterns: z
    .string()
    .describe('Historical data on feed consumption patterns.'),
  nutrientRequirements: z
    .string()
    .describe('Specific nutrient requirements for the poultry.'),
  currentFeedMix: z.string().describe('The current composition of the feed mix.'),
  availableIngredients: z.string().describe('List of available feed ingredients.'),
});
export type OptimizeFeedMixInput = z.infer<typeof OptimizeFeedMixInputSchema>;

const OptimizeFeedMixOutputSchema = z.object({
  optimizedFeedMix: z
    .string()
    .describe('The optimized feed mix composition.'),
  rationale: z
    .string()
    .describe('Explanation of why the feed mix was optimized this way.'),
  estimatedCostSavings: z
    .string()
    .describe('The estimated cost savings from the optimized feed mix.'),
  expectedGrowthImprovement: z
    .string()
    .describe('The expected growth improvement from the optimized feed mix.'),
});
export type OptimizeFeedMixOutput = z.infer<typeof OptimizeFeedMixOutputSchema>;

export async function optimizeFeedMix(input: OptimizeFeedMixInput): Promise<OptimizeFeedMixOutput> {
  return optimizeFeedMixFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeFeedMixPrompt',
  input: {schema: OptimizeFeedMixInputSchema},
  output: {schema: OptimizeFeedMixOutputSchema},
  prompt: `You are an expert in poultry nutrition and feed optimization. Your goal is to analyze feed consumption patterns, nutrient requirements, and available ingredients to recommend an optimized feed mix that maximizes growth and health while minimizing costs.

Analyze the following data to provide an optimized feed mix:

Consumption Patterns: {{{consumptionPatterns}}}
Nutrient Requirements: {{{nutrientRequirements}}}
Current Feed Mix: {{{currentFeedMix}}}
Available Ingredients: {{{availableIngredients}}}

Provide the optimized feed mix composition, a rationale for the changes, the estimated cost savings, and the expected growth improvement.

Optimized Feed Mix:`,
});

const optimizeFeedMixFlow = ai.defineFlow(
  {
    name: 'optimizeFeedMixFlow',
    inputSchema: OptimizeFeedMixInputSchema,
    outputSchema: OptimizeFeedMixOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

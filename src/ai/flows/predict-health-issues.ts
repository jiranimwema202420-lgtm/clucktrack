'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting potential health issues in poultry flocks.
 *
 * predictHealthIssues - A function that predicts potential health issues based on flock data.
 * PredictHealthIssuesInput - The input type for the predictHealthIssues function.
 * PredictHealthIssuesOutput - The return type for the predictHealthIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictHealthIssuesInputSchema = z.object({
  historicalData: z.string().describe('Historical data of the flock, including past health records, environmental conditions, and feed consumption.'),
  realTimeSensorReadings: z.string().describe('Real-time sensor readings from the farm, such as temperature, humidity, and air quality.'),
});
export type PredictHealthIssuesInput = z.infer<typeof PredictHealthIssuesInputSchema>;

const PredictHealthIssuesOutputSchema = z.object({
  potentialHealthIssues: z.string().describe('A list of potential health issues predicted for the flock.'),
  riskLevels: z.string().describe('The risk levels associated with each potential health issue (e.g., low, medium, high).'),
  recommendations: z.string().describe('Recommendations for proactive measures to address the predicted health issues.'),
});
export type PredictHealthIssuesOutput = z.infer<typeof PredictHealthIssuesOutputSchema>;

export async function predictHealthIssues(input: PredictHealthIssuesInput): Promise<PredictHealthIssuesOutput> {
  return predictHealthIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictHealthIssuesPrompt',
  input: {schema: PredictHealthIssuesInputSchema},
  output: {schema: PredictHealthIssuesOutputSchema},
  prompt: `You are an AI assistant specialized in predicting potential health issues in poultry flocks.

  Based on the historical data and real-time sensor readings provided, identify potential health issues, assess their risk levels, and provide recommendations for proactive measures.

  Historical Data:
  {{historicalData}}

  Real-time Sensor Readings:
  {{realTimeSensorReadings}}

  Respond with potential health issues, their risk levels, and recommendations.
  `, 
});

const predictHealthIssuesFlow = ai.defineFlow(
  {
    name: 'predictHealthIssuesFlow',
    inputSchema: PredictHealthIssuesInputSchema,
    outputSchema: PredictHealthIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


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
  historicalData: z.string().describe('A summary of the flock\'s history, including age, breed, type, mortality rate, and any relevant past incidents.'),
  realTimeSensorReadings: z.string().describe('Real-time sensor readings (temperature, humidity, ammonia) and any manual observations about behavior or consumption changes.'),
});
export type PredictHealthIssuesInput = z.infer<typeof PredictHealthIssuesInputSchema>;

const issueSchema = z.object({
  issue: z.string().describe('A potential health issue (e.g., Coccidiosis, Heat Stress).'),
  risk: z.enum(['High', 'Medium', 'Low']).describe('The assessed risk level for this issue.'),
});

const PredictHealthIssuesOutputSchema = z.object({
  diagnosis: z.string().describe('A single, primary diagnosis summarizing the most likely health issue. (e.g., "Probable Coccidiosis Outbreak" or "Signs of Moderate Heat Stress").'),
  potentialIssues: z.array(issueSchema).describe('A list of potential health issues and their associated risk levels.'),
  recommendations: z.string().describe('A clear, actionable list of recommendations to mitigate the identified risks. Start with the highest-risk issue.'),
});
export type PredictHealthIssuesOutput = z.infer<typeof PredictHealthIssuesOutputSchema>;

export async function predictHealthIssues(input: PredictHealthIssuesInput): Promise<PredictHealthIssuesOutput> {
  return predictHealthIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictHealthIssuesPrompt',
  input: {schema: PredictHealthIssuesInputSchema},
  output: {schema: PredictHealthIssuesOutputSchema},
  prompt: `You are a veterinary AI specializing in poultry health diagnostics. Your goal is to identify potential health risks based on the provided data and suggest actionable, prioritized recommendations.

  **Analyze the following data:**

  **Flock History & Vitals:**
  {{{historicalData}}}

  **Current Conditions & Observations:**
  {{{realTimeSensorReadings}}}

  **Your Task:**
  1.  **Form a Primary Diagnosis:** Based on all data, provide a single, conclusive diagnosis that summarizes the main issue.
  2.  **Identify Potential Issues & Risks:** Create a list of potential health issues. For each issue, assign a risk level: 'High', 'Medium', or 'Low'. Be decisive. A combination of abnormal sensor readings and relevant history should elevate the risk.
  3.  **Provide Recommendations:** Give clear, practical steps the farmer should take, starting with the highest priority. For example, if Coccidiosis risk is high, recommend checking litter moisture and consulting a vet. If heat stress is a risk, recommend increasing ventilation.

  Provide a concise and structured response in the required JSON format.
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

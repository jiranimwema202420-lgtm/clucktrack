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

Here are some examples of common questions and the style of answer you should provide:

---
**FAQ Schema Example 1:**
*Question:* "What are the ideal temperature and humidity levels for broiler chickens?"
*Answer:*
"Maintaining the right temperature and humidity is critical for broiler health and growth. Here’s a general guide:
- **Week 1 (Chicks):** 32-35°C (90-95°F) with 60-70% humidity. This keeps them warm and prevents dehydration.
- **Week 2:** Gradually reduce to 29-32°C (85-90°F).
- **Week 3:** 26-29°C (80-85°F).
- **Week 4 onwards:** 21-26°C (70-80°F) with 40-60% humidity.
Always monitor the birds' behavior. If they are huddling, it's too cold. If they are panting and spreading their wings, it's too hot."

---
**FAQ Schema Example 2:**
*Question:* "How can I improve eggshell quality in my laying hens?"
*Answer:*
"Poor eggshell quality is often linked to nutrition, age, or stress. Here are key areas to focus on:
1.  **Calcium Source:** Ensure a constant supply of calcium. Provide crushed oyster shells or limestone in a separate feeder so hens can self-regulate. A hen needs about 4-5 grams of calcium per day.
2.  **Vitamin D3:** This vitamin is essential for calcium absorption. Check if your feed has adequate levels.
3.  **Phosphorus Levels:** The calcium-to-phosphorus ratio is important. It should be around 10:1 for layers.
4.  **Clean Water:** Fresh, clean water is crucial for nutrient absorption and overall health.
5.  **Reduce Stress:** Overcrowding, loud noises, or extreme temperatures can stress hens and affect egg quality."
---

Now, answer the following question from a farmer.

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

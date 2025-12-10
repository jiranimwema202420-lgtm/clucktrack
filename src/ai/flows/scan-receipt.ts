
'use server';

/**
 * @fileOverview A flow for scanning receipts and extracting expenditure data.
 *
 * - scanReceipt - A function that handles the receipt scanning process.
 * - ScanReceiptInput - The input type for the scanReceipt function.
 * - ScanReceiptOutput - The return type for the scanReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanReceiptInput = z.infer<typeof ScanReceiptInputSchema>;

const ScanReceiptOutputSchema = z.object({
  category: z.string().describe('The most likely category of the expense (e.g., Feed, Medicine, Equipment, Utilities).'),
  quantity: z.number().describe('The total quantity of items purchased. Default to 1 if not clearly specified.'),
  unitPrice: z.number().describe('The price per unit. If not available, calculate from total amount and quantity.'),
  amount: z.number().describe('The total amount of the expenditure. This is the most important field.'),
  description: z.string().describe('A brief summary of items purchased. (e.g., "50kg Broiler Feed, 1x Vet-service").'),
  expenditureDate: z.string().describe('The date of the expenditure in YYYY-MM-DD format.'),
});
export type ScanReceiptOutput = z.infer<typeof ScanReceiptOutputSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  return scanReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: {schema: ScanReceiptInputSchema},
  output: {schema: ScanReceiptOutputSchema},
  prompt: `You are an intelligent receipt scanner for a poultry farm. Analyze the following receipt image and extract the expenditure details.
Your primary goal is to accurately identify the total amount.
If a date is present, extract it. If not, use today's date.
Summarize the items into a short description.
Attempt to categorize the expense based on common poultry farm categories (Feed, Medicine, Equipment, Utilities, Maintenance, Labor, Other).
If quantity and unit price are clear, extract them. Otherwise, default quantity to 1 and use the total amount as the unit price.

Analyze this image: {{media url=receiptImage}}`,
});

const scanReceiptFlow = ai.defineFlow(
  {
    name: 'scanReceiptFlow',
    inputSchema: ScanReceiptInputSchema,
    outputSchema: ScanReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

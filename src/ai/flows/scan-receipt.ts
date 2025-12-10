
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
  prompt: `You are an intelligent receipt scanner for a poultry farm. Your primary goal is to accurately extract the total expenditure amount from the provided receipt image. Analyze the image and fill in the corresponding fields.

Here are your instructions:
1.  **Total Amount is Priority:** Find the final, total amount paid. This is the most critical piece of information.
2.  **Date Extraction:** Look for a date on the receipt. If you find one, format it as YYYY-MM-DD. If no date is visible, use today's date.
3.  **Item Summary:** Create a brief, clear `description` of the items purchased. For example, "50kg Broiler Feed, Vitamins" or "New water drinkers".
4.  **Categorization:** Based on the items, determine the most likely `category`. Use one of the following common farm categories: 'Feed', 'Medicine', 'Equipment', 'Utilities', 'Maintenance', 'Labor', 'Day Old Chicks', 'Other'.
5.  **Quantity and Unit Price:**
    *   If a clear quantity and price per item are listed, extract them for the primary item.
    *   If quantity is not clear, default `quantity` to 1.
    *   If `unitPrice` is not clear, calculate it by dividing the total `amount` by the `quantity`. Ensure the final amount is the source of truth.

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

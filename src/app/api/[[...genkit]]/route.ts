import { genkitNext } from '@genkit-ai/next';
import '@/ai/flows/optimize-feed-mix';
import '@/ai/flows/predict-health-issues';
import '@/ai/flows/poultry-qa';

export const { GET, POST } = genkitNext();

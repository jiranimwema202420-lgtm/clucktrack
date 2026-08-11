import { NextResponse } from 'next/server';
import { optimizeFeedMix } from '@/ai/flows/optimize-feed-mix';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await optimizeFeedMix(body);

    if (!result) {
      throw new Error('Feed optimization returned no result.');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Feed optimization API error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown feed optimization error';

    return NextResponse.json(
      {
        error: 'Feed optimization failed',
        details:
          process.env.NODE_ENV === 'development'
            ? message
            : 'The AI service could not generate a feed optimization result.',
      },
      { status: 500 }
    );
  }
}

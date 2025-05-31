import { NextResponse } from 'next/server';
import { generateText } from '@/services/ai-service';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const encoder = new TextEncoder();

    // Get user info from Clerk
    const { userId: clerkUserId } = await auth();
    let questionnaireResponses = null;
    let watchlist = null;

    if (clerkUserId) {
      // Find user by Clerk ID
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
      });
      if (user) {
        // Fetch questionnaire responses
        questionnaireResponses = await prisma.response.findMany({
          where: { userId: user.id },
          select: { questionId: true, answer: true },
        });
        // Fetch watchlist
        watchlist = await prisma.watchlist.findMany({
          where: { userId: user.id },
          select: { symbol: true, notes: true, addedAt: true },
        });
      }
    }

    // Compose user context for the AI
    const userContext = {
      questionnaireResponses,
      watchlist,
    };

    const stream = new ReadableStream({
      async start(controller) {
        await generateText(prompt, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        }, userContext);
        controller.close();
      }
    });
    return new NextResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}

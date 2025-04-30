import { NextResponse } from 'next/server';
import { generateText } from '@/services/ai-service';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        await generateText(prompt, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        });
        controller.close();
      }
    });
    return new NextResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}

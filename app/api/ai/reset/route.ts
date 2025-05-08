import { NextResponse } from 'next/server';
import { resetChatSession } from '@/services/ai-service';

export async function POST() {
  try {
    await resetChatSession();
    return NextResponse.json({ success: true, message: 'Conversation reset successfully' });
  } catch (error) {
    console.error('Reset AI conversation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset conversation' }, { status: 500 });
  }
} 
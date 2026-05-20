import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { user_id, type, message } = body;

    if (!user_id || !type || !message) {
      return NextResponse.json({ success: false, error: 'user_id, type, and message required' }, { status: 400 });
    }

    const { error } = await supabase.from('notifications').insert({ user_id, type, message });
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { notification_sent: true } });
  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

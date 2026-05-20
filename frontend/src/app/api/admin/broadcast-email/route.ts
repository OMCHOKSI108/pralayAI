import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { recipient_filter, subject, html } = body;

    if (!subject || !html) {
      return NextResponse.json({ success: false, error: 'subject and html required' }, { status: 400 });
    }

    let emails: string[] = [];

    if (recipient_filter === 'all') {
      const { data: students } = await supabase.from('users').select('email').eq('role', 'student');
      emails = students?.map((s: { email: string }) => s.email) || [];
    } else if (Array.isArray(recipient_filter)) {
      const { data: users } = await supabase.from('users').select('email').in('id', recipient_filter);
      emails = users?.map((u: { email: string }) => u.email) || [];
    }

    if (emails.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients found' }, { status: 400 });
    }

    if (resend) await resend?.emails.send({
      from: 'careers@hellware.in',
      to: emails.slice(0, 50),
      subject,
      html,
    });

    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'broadcast_email',
      target_type: 'email',
      target_id: 'broadcast',
      metadata: { recipient_count: emails.length, subject },
    });

    return NextResponse.json({ success: true, data: { sent_to: emails.length } });
  } catch (error) {
    console.error('Broadcast email error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

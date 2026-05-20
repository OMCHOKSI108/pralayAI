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
    const { application_id, rejection_note } = body;

    if (!application_id) {
      return NextResponse.json({ success: false, error: 'application_id is required' }, { status: 400 });
    }

    const { data: application } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    await supabase
      .from('applications')
      .update({ status: 'rejected', reviewed_by: user.id, review_note: rejection_note, updated_at: new Date().toISOString() })
      .eq('id', application_id);

    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'reject_application',
      target_type: 'application',
      target_id: application_id,
      metadata: { note: rejection_note },
    });

    if (resend) await resend?.emails.send({
      from: 'careers@hellware.in',
      to: application.email,
      subject: 'Hellware Application Update',
      html: `<p>Hi ${application.full_name},</p><p>Thank you for your interest in Hellware. After careful review, we are unable to move forward with your application at this time.${rejection_note ? `<p>Feedback: ${rejection_note}</p>` : ''}</p><p>We encourage you to apply again in the future.</p><p>— Hellware Team</p>`,
    });

    return NextResponse.json({ success: true, data: { application_id } });
  } catch (error) {
    console.error('Reject application error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

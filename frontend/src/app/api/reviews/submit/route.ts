import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function PATCH(request: NextRequest) {
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
    if (!userData || !['admin', 'reviewer'].includes(userData.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { submission_id, status, feedback } = body;

    if (!submission_id || !status) {
      return NextResponse.json({ success: false, error: 'submission_id and status are required' }, { status: 400 });
    }

    const validStatuses = ['approved', 'changes_requested', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const { data: submission } = await supabase
      .from('submissions')
      .select('*, student_projects!inner(student_id, project_id)')
      .eq('id', submission_id)
      .single();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const { error: reviewError } = await supabase.from('reviews').insert({
      submission_id,
      reviewer_id: user.id,
      feedback,
      status,
    });

    if (reviewError) {
      return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 });
    }

    await supabase.from('submissions').update({ status }).eq('id', submission_id);

    if (status === 'approved') {
      await supabase
        .from('student_projects')
        .update({ status: 'completed' })
        .eq('id', submission.student_project_id);

      await supabase.from('certificates').select('id').eq('student_id', submission.student_projects.student_id).eq('project_id', submission.student_projects.project_id).then(async ({ data: existing }) => {
        if (!existing || existing.length === 0) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/certificates/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` },
            body: JSON.stringify({ student_id: submission.student_projects.student_id, project_id: submission.student_projects.project_id }),
          });
        }
      });

      await supabase.from('notifications').insert({
        user_id: submission.student_projects.student_id,
        type: 'submission_approved',
        message: 'Your submission has been approved!',
      });
    } else if (status === 'changes_requested') {
      await supabase.from('notifications').insert({
        user_id: submission.student_projects.student_id,
        type: 'feedback',
        message: `Reviewer feedback: ${feedback}`,
      });
    }

    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'review_submission',
      target_type: 'submission',
      target_id: submission_id,
      metadata: { status, feedback },
    });

    const { data: student } = await supabase.from('users').select('email').eq('id', submission.student_projects.student_id).single();
    const { data: project } = await supabase.from('projects').select('title').eq('id', submission.student_projects.project_id).single();

    if (student) {
      if (resend) await resend?.emails.send({
        from: 'careers@hellware.in',
        to: student.email,
        subject: status === 'approved' ? 'Submission Approved — Hellware' : 'Feedback on Your Submission — Hellware',
        html: `<p>Hi,</p><p>Your submission for "${project?.title}" has been ${status}.${feedback ? `<p>Feedback: ${feedback}</p>` : ''}</p><p>— Hellware Team</p>`,
      });
    }

    return NextResponse.json({ success: true, data: { submission_id, status } });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-vercel-cron-secret') || request.headers.get('authorization');
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: activeStudents } = await supabase
      .from('student_projects')
      .select(`
        id,
        deadline,
        status,
        students:users!inner(name, email),
        projects!inner(title),
        milestones(id, is_completed)
      `)
      .in('status', ['assigned', 'in_progress']);

    if (!activeStudents || activeStudents.length === 0) {
      return NextResponse.json({ success: true, data: { sent: 0 } });
    }

    const emailsToSend = activeStudents.map((sp: Record<string, unknown>) => {
      const milestones = sp.milestones as Array<{ is_completed: boolean }> || [];
      const completed = milestones.filter((m) => m.is_completed).length;
      const total = milestones.length;
      const project = sp.projects as { title: string };
      const student = sp.students as { name: string; email: string };
      const deadline = sp.deadline as string;

      const daysRemaining = deadline ? Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

      if (resend) return resend?.emails.send({
        from: 'careers@hellware.in',
        to: student.email,
        subject: 'Weekly Reminder — Keep Building!',
        html: `<p>Hi ${student.name},</p><p>Progress on "${project?.title}": ${completed}/${total} milestones completed.${daysRemaining !== null ? ` ${daysRemaining} days remaining.` : ''}</p><p>Keep going!</p><p>— Hellware Team</p>`,
      });
    });

    await Promise.all(emailsToSend);

    return NextResponse.json({ success: true, data: { sent: emailsToSend.length } });
  } catch (error) {
    console.error('Weekly reminder error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

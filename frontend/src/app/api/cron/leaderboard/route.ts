import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-vercel-cron-secret') || request.headers.get('authorization');
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: students } = await supabase
      .from('student_projects')
      .select('student_id');

    if (!students) {
      return NextResponse.json({ success: true, data: { recalculated: 0 } });
    }

    const uniqueStudentIds = [...new Set(students.map((sp: { student_id: string }) => sp.student_id))];

    for (const studentId of uniqueStudentIds) {
      await supabase.rpc('recalculate_leaderboard_score', { p_student_id: studentId });
    }

    return NextResponse.json({ success: true, data: { recalculated: uniqueStudentIds.length } });
  } catch (error) {
    console.error('Leaderboard cron error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

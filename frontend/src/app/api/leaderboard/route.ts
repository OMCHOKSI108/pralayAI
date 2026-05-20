import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    let query = supabase
      .from('leaderboard_scores')
      .select(`
        score,
        milestones_completed,
        submissions_approved,
        student_profiles!inner(name, avatar_url, domain),
        users!inner(name)
      `)
      .order('score', { ascending: false })
      .limit(50);

    if (domain) {
      query = query.eq('student_profiles.domain', domain);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    const formatted = data.map((entry: Record<string, unknown>) => ({
      score: entry.score,
      milestones_completed: entry.milestones_completed,
      submissions_approved: entry.submissions_approved,
      name: ((entry.student_profiles as Record<string, unknown>)?.name as string) || ((entry.users as Record<string, unknown>)?.name as string),
      avatar_url: (entry.student_profiles as Record<string, unknown>)?.avatar_url as string,
      domain: (entry.student_profiles as Record<string, unknown>)?.domain as string,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

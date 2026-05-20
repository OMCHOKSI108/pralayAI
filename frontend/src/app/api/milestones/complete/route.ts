import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

    const body = await request.json();
    const { milestone_id } = body;

    if (!milestone_id) {
      return NextResponse.json({ success: false, error: 'milestone_id required' }, { status: 400 });
    }

    const { data: milestone } = await supabase
      .from('milestones')
      .select('*, student_projects!inner(student_id)')
      .eq('id', milestone_id)
      .single();

    if (!milestone || milestone.student_projects.student_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Milestone not found or not yours' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('milestones')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', milestone_id);

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Failed to update milestone' }, { status: 500 });
    }

    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, is_completed')
      .eq('student_project_id', milestone.student_project_id);

    const allComplete = allMilestones?.every((m: { is_completed: boolean }) => m.is_completed);
    if (allComplete) {
      await supabase
        .from('student_projects')
        .update({ status: 'in_progress' })
        .eq('id', milestone.student_project_id);
    }

    const rpcError = await supabase.rpc('recalculate_leaderboard_score', { p_student_id: user.id });
    if (rpcError.error) {
      console.error('Leaderboard recalc error:', rpcError.error);
    }

    return NextResponse.json({ success: true, data: { milestone_id, completed: true, all_complete: allComplete } });
  } catch (error) {
    console.error('Milestone complete error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    const [
      { count: totalApplications },
      { count: activeStudents },
      { count: pendingReviews },
      { data: completionsThisMonth },
      { data: totalContributions },
    ] = await Promise.all([
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('student_projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('student_projects').select('id').eq('status', 'completed').gte('assigned_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('contributions').select('amount').eq('status', 'success'),
    ]);

    const totalAmount = totalContributions?.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        total_applications: totalApplications || 0,
        active_students: activeStudents || 0,
        pending_reviews: pendingReviews || 0,
        completions_this_month: completionsThisMonth?.length || 0,
        total_contributions_amount: totalAmount,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

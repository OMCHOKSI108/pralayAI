import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { referral_code, new_user_id } = body;

    if (!referral_code || !new_user_id) {
      return NextResponse.json({ success: false, error: 'referral_code and new_user_id required' }, { status: 400 });
    }

    const { data: referrer } = await supabase
      .from('student_profiles')
      .select('user_id')
      .eq('referral_code', referral_code)
      .single();

    if (!referrer) {
      return NextResponse.json({ success: false, error: 'Invalid referral code' }, { status: 404 });
    }

    const { data: newUser } = await supabase.from('users').select('email').eq('id', new_user_id).single();
    if (!newUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await supabase.from('referrals').insert({
      referrer_id: referrer.user_id,
      referred_email: newUser.email,
      referred_user_id: new_user_id,
      status: 'active',
    });

    const { data: activeReferrals } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer.user_id)
      .eq('status', 'active');

    if (activeReferrals && activeReferrals.length >= 2) {
      await supabase.from('student_profiles').update({ contribution_score: 100 }).eq('user_id', referrer.user_id);
    }

    return NextResponse.json({ success: true, data: { referral_tracked: true } });
  } catch (error) {
    console.error('Referral track error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) : null;

export async function POST(request: NextRequest) {
  try {
    if (!razorpay) {
      return NextResponse.json({ success: false, error: 'Payment service unavailable' }, { status: 503 });
    }

    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { amount } = body;

    if (!['149', '199', '299'].includes(amount)) {
      return NextResponse.json({ success: false, error: 'Amount must be 149, 199, or 299' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: parseInt(amount) * 100,
      currency: 'INR',
      receipt: `hellware_${user.id}_${Date.now()}`,
    });

    await supabase.from('contributions').insert({
      student_id: user.id,
      amount: parseInt(amount),
      razorpay_order_id: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

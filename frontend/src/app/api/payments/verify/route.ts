import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment details' }, { status: 400 });
    }

    const generatedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await supabase
        .from('contributions')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    const { data: contribution } = await supabase
      .from('contributions')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (!contribution) {
      return NextResponse.json({ success: false, error: 'Contribution not found' }, { status: 404 });
    }

    await supabase
      .from('contributions')
      .update({ status: 'success', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id);

    const { data: cert } = await supabase
      .from('certificates')
      .select('id')
      .eq('student_id', contribution.student_id)
      .limit(1);

    if (!cert || cert.length === 0) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` },
        body: JSON.stringify({ student_id: contribution.student_id }),
      });
    }

    const { data: student } = await supabase.from('users').select('name, email').eq('id', contribution.student_id).single();
    if (student) {
      if (resend) await resend?.emails.send({
        from: 'careers@hellware.in',
        to: student.email,
        subject: 'Contribution Confirmed — Hellware',
        html: `<p>Hi ${student.name},</p><p>Your contribution of ₹${contribution.amount} has been confirmed. Your certificate is being processed.</p><p>Payment ID: ${razorpay_payment_id}</p><p>— Hellware Team</p>`,
      });
    }

    return NextResponse.json({ success: true, data: { payment_id: razorpay_payment_id } });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

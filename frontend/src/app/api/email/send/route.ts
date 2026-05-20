import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ success: false, error: 'Resend not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'hellware@atomicmail.io',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { id: data?.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

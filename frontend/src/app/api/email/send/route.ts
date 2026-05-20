import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const mailOptions = {
      from: `"Om Choksi - HR, Hellware" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, data: { message: 'Email sent' } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to send email' }, { status: 500 });
  }
}

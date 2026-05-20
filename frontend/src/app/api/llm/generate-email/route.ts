import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, studentEmail, internshipDomain, emailType } = body;

    if (!studentName || !emailType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = 'You are an internship program coordinator. Generate professional, warm email content. Return ONLY the plain text email body — no markdown, no json wrapping, no extra commentary.';

    let userPrompt: string;
    switch (emailType) {
      case 'welcome':
        userPrompt = `Write a welcome email for ${studentName} (${studentEmail}) who has been accepted into the ${internshipDomain || 'Cyber Security'} internship at Hellware. Keep it concise, professional, and welcoming. Include next steps about onboarding.`;
        break;
      case 'completion':
        userPrompt = `Write a congratulatory email to ${studentName} (${studentEmail}) for successfully completing the ${internshipDomain || 'Cyber Security'} internship at Hellware. Mention certificate issuance and payment instructions for the certificate.`;
        break;
      case 'certificate_ready':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) informing them that their internship certificate from Hellware is now ready and has been uploaded to their dashboard. Include download instructions.`;
        break;
      case 'payment_verified':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) confirming that their certificate payment has been verified. Mention that the certificate will be issued within 24 hours.`;
        break;
      default:
        userPrompt = `Write a professional email to ${studentName} (${studentEmail}) regarding their ${internshipDomain || 'Cyber Security'} internship at Hellware.`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: 'Groq API error', details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const emailContent = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ success: true, data: { emailContent } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

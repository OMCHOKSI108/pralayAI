import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const HR_NAME = 'Om Choksi';
const COMPANY = 'Hellware Technology Solutions';

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }
    const body = await request.json();
    const { studentName, studentEmail, internshipDomain, emailType } = body;

    if (!studentName || !emailType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = `You are ${HR_NAME}, HR Manager at ${COMPANY}. Write professional, warm, corporate emails. Sign every email with:
---
Best regards,
${HR_NAME}
HR Manager
${COMPANY}
--. Return ONLY the plain text email body. No markdown, no json wrapping.`;

    let userPrompt: string;
    switch (emailType) {
      case 'application_received':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) confirming that their internship application for ${internshipDomain || 'Cyber Security'} has been received at ${COMPANY}. Mention they will hear back within 1-2 days. Professional, warm tone.`;
        break;
      case 'congrats_offer':
        userPrompt = `Write a congratulatory offer letter email to ${studentName} (${studentEmail}) for being selected for the ${internshipDomain || 'Cyber Security'} internship at ${COMPANY}. Include their temporary login credentials (Student ID: HW-${studentName.replace(/\s/g,'').toUpperCase().slice(0,6)}, Password: Temp@${Math.floor(1000 + Math.random() * 9000)}). Mention the Offer Letter PDF is attached. Ask them to login and download it.`;
        break;
      case 'task_details':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) with their assigned project details for the ${internshipDomain || 'Cyber Security'} internship at ${COMPANY}. Mention the project milestones, deadlines, and resources available in their dashboard. Professional tone.`;
        break;
      case 'weekly_report':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) requesting their weekly report submission for the ${internshipDomain || 'Cyber Security'} internship at ${COMPANY}. Ask them to log hours, achievements, and blockers in their dashboard. Professional tone.`;
        break;
      case 'final_submission':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) requesting their final project submission for the ${internshipDomain || 'Cyber Security'} internship at ${COMPANY}. Ask them to submit GitHub links, live demo URL, screenshots, and a video walkthrough via their dashboard. Professional tone.`;
        break;
      case 'submission_approved':
        userPrompt = `Write a congratulatory email to ${studentName} (${studentEmail}) confirming their final submission has been reviewed and APPROVED by the ${COMPANY} team. Mention they now need to complete the certificate payment process to receive their official internship certificate and Letter of Recommendation. Professional, proud tone.`;
        break;
      case 'payment_verified':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) confirming their certificate payment has been verified successfully. Mention their official ${COMPANY} internship certificate and Letter of Recommendation will be issued within 24 hours. Professional tone.`;
        break;
      case 'certificate_ready':
        userPrompt = `Write an email to ${studentName} (${studentEmail}) informing them that their ${COMPANY} internship certificate and Letter of Recommendation (signed by HR Manager ${HR_NAME}) are now ready. Include instructions to download from their dashboard. Professional, proud tone.`;
        break;
      default:
        userPrompt = `Write a professional email to ${studentName} (${studentEmail}) regarding their ${internshipDomain || 'Cyber Security'} internship at ${COMPANY}. Signed by ${HR_NAME}, HR Manager.`;
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
        max_tokens: 800,
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

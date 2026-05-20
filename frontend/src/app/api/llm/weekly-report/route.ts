import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { studentName, domain, week, hoursLogged, locCount, achievements, blockers, projectName } = body;

    if (!studentName || !achievements) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = 'You are an internship coordinator writing a professional weekly performance summary. Return ONLY the plain text summary — no markdown, no json wrapping, no extra commentary.';

    const userPrompt = `Write a professional weekly performance summary for ${studentName}, an intern in ${domain || 'Cyber Security'} at Hellware Technology Solutions.

Week ${week} details:
- Hours logged: ${hoursLogged || 'N/A'}
- Lines of code: ${locCount || 'N/A'}
- Project: ${projectName || 'Assigned Project'}
- Achievements reported: ${achievements}
- Blockers reported: ${blockers || 'None'}

Write 2-3 paragraphs summarizing their progress, highlighting the achievements, addressing the blockers with solutions, and providing encouragement. Professional, warm tone.`;

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
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: 'Groq API error', details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ success: true, data: { summary } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

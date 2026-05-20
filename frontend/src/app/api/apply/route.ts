import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { applicationSchema } from '@/lib/validations/application';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const supabase = createServerClient();

    let body: unknown;
    let resumeFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        college: formData.get('college'),
        graduation_year: formData.get('graduation_year'),
        domain: formData.get('domain'),
        skills: formData.get('skills') ? JSON.parse(formData.get('skills') as string) : [],
        github_url: formData.get('github_url'),
        linkedin_url: formData.get('linkedin_url'),
      };
      resumeFile = formData.get('resume') as File | null;
    } else {
      body = await request.json();
    }

    const validation = applicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    let resumeUrl: string | null = null;

    if (resumeFile) {
      if (resumeFile.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: 'Resume must be a PDF file' },
          { status: 400 }
        );
      }
      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Resume must be under 5MB' },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const filePath = `applications/${timestamp}-${data.email}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, { contentType: 'application/pdf' });

      if (uploadError) {
        return NextResponse.json(
          { success: false, error: 'Failed to upload resume' },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
      resumeUrl = urlData.publicUrl;
    }

    const { data: application, error: dbError } = await supabase
      .from('applications')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        college: data.college,
        graduation_year: data.graduation_year,
        domain: data.domain,
        skills: data.skills,
        github_url: data.github_url || null,
        linkedin_url: data.linkedin_url || null,
        resume_url: resumeUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    if (resend) await resend?.emails.send({
      from: 'careers@hellware.in',
      to: data.email,
      subject: 'Application Received — Hellware',
      html: `<p>Hi ${data.full_name},</p><p>We have received your application for the ${data.domain} domain. We will review it and get back to you soon.</p><p>— Hellware Team</p>`,
    });

    return NextResponse.json(
      { success: true, data: { application_id: application.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Apply route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

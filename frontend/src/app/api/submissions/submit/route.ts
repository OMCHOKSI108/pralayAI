import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown>;
    const screenshotFiles: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        student_project_id: formData.get('student_project_id'),
        github_url: formData.get('github_url'),
        deployment_url: formData.get('deployment_url'),
        video_url: formData.get('video_url'),
        notes: formData.get('notes'),
      };
      for (let i = 0; i < 5; i++) {
        const file = formData.get(`screenshot_${i}`) as File | null;
        if (file) screenshotFiles.push(file);
      }
    } else {
      body = await request.json();
    }

    const { data: studentProject } = await supabase
      .from('student_projects')
      .select('id')
      .eq('id', body.student_project_id)
      .eq('student_id', user.id)
      .single();

    if (!studentProject) {
      return NextResponse.json({ success: false, error: 'Project not found or not assigned to you' }, { status: 404 });
    }

    const screenshotUrls: string[] = [];
    for (const file of screenshotFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Screenshots must be JPEG, PNG, or WebP' }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Screenshots must be under 10MB' }, { status: 400 });
      }

      const filePath = `submissions/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-screenshots')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) continue;
      const { data: urlData } = supabase.storage.from('project-screenshots').getPublicUrl(uploadData.path);
      screenshotUrls.push(urlData.publicUrl);
    }

    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        student_project_id: body.student_project_id,
        github_url: body.github_url || null,
        deployment_url: body.deployment_url || null,
        video_url: body.video_url || null,
        notes: body.notes || null,
        screenshot_urls: screenshotUrls,
        status: 'pending',
      })
      .select()
      .single();

    if (subError) {
      return NextResponse.json({ success: false, error: 'Failed to create submission' }, { status: 500 });
    }

    await supabase
      .from('student_projects')
      .update({ status: 'submitted' })
      .eq('id', body.student_project_id);

    const { data: project } = await supabase
      .from('projects')
      .select('title')
      .eq('id', studentProject.id)
      .single();

    if (resend) await resend?.emails.send({
      from: 'careers@hellware.in',
      to: user.email!,
      subject: 'Submission Received — Hellware',
      html: `<p>Hi,</p><p>Your submission for "${project?.title}" has been received. Our reviewers will evaluate it and provide feedback soon.</p><p>— Hellware Team</p>`,
    });

    const { data: reviewers } = await supabase.from('users').select('id').in('role', ['reviewer', 'admin']);
    if (reviewers) {
      const notifications = reviewers.map((r: { id: string }) => ({
        user_id: r.id,
        type: 'new_submission',
        message: `New submission for project "${project?.title}"`,
      }));
      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({ success: true, data: { submission_id: submission.id } }, { status: 201 });
  } catch (error) {
    console.error('Submit route error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

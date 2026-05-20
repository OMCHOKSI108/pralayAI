import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { nanoid } from 'nanoid';

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
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { application_id, project_id, deadline } = body;

    if (!application_id) {
      return NextResponse.json({ success: false, error: 'application_id is required' }, { status: 400 });
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'accepted', reviewed_by: user.id, updated_at: new Date().toISOString() })
      .eq('id', application_id);

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', application.email)
      .single();

    let studentUserId = existingUser?.id;

    if (!existingUser) {
      const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        application.email,
        { data: { name: application.full_name } }
      );
      if (inviteError) {
        return NextResponse.json({ success: false, error: 'Failed to create user account' }, { status: 500 });
      }
      studentUserId = authUser.user.id;
    }

    const referralCode = nanoid(8);

    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: studentUserId,
        college: application.college,
        graduation_year: application.graduation_year,
        skills: application.skills,
        github_url: application.github_url,
        linkedin_url: application.linkedin_url,
        domain: application.domain,
        referral_code: referralCode,
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ success: false, error: 'Failed to create student profile' }, { status: 500 });
    }

    if (project_id) {
      const { data: studentProject, error: spError } = await supabase
        .from('student_projects')
        .insert({
          student_id: studentUserId,
          project_id,
          deadline: deadline || null,
          status: 'assigned',
        })
        .select()
        .single();

      if (!spError && studentProject) {
        const { data: project } = await supabase.from('projects').select('milestones').eq('id', project_id).single();
        if (project?.milestones) {
          const milestoneRows = (project.milestones as Array<{ title: string; order: number }>).map((m: { title: string; order: number }) => ({
            student_project_id: studentProject.id,
            title: m.title,
            order_index: m.order,
          }));
          await supabase.from('milestones').insert(milestoneRows);
        }
      }
    }

    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'accept_application',
      target_type: 'application',
      target_id: application_id,
      metadata: { student_id: studentUserId },
    });

    if (resend) await resend?.emails.send({
      from: 'careers@hellware.in',
      to: application.email,
      subject: 'Welcome to Hellware — You Are In!',
      html: `<p>Hi ${application.full_name},</p><p>Congratulations! Your application has been accepted. You can now access your dashboard and start building.</p><p>Login: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard</p><p>— Hellware Team</p>`,
    });

    return NextResponse.json({ success: true, data: { student_profile_id: profile.id } });
  } catch (error) {
    console.error('Accept application error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

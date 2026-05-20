import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params;
    const supabase = createServerClient();

    const { data: cert, error } = await supabase
      .from('certificates')
      .select(`
        cert_id,
        issued_at,
        student_profiles!inner(name, domain),
        projects!inner(title, domain)
      `)
      .eq('cert_id', certId)
      .single();

    if (error || !cert) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    const studentProfile = cert.student_profiles as unknown as { name: string; domain: string } | null;
    const project = cert.projects as unknown as { title: string; domain: string } | null;

    return NextResponse.json({
      success: true,
      data: {
        cert_id: cert.cert_id,
        student_name: studentProfile?.name,
        project_title: project?.title,
        domain: project?.domain,
        issued_at: cert.issued_at,
      },
    });
  } catch (error) {
    console.error('Certificate verify error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

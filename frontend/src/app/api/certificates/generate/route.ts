import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !authHeader?.includes('service')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { student_id, project_id } = body;

    if (!student_id || !project_id) {
      return NextResponse.json({ success: false, error: 'student_id and project_id required' }, { status: 400 });
    }

    const certId = `HW-${new Date().toISOString().slice(0, 7).replace('-', '')}-${nanoid(4).toUpperCase()}`;

    const { data: student } = await supabase.from('users').select('name').eq('id', student_id).single();
    const { data: project } = await supabase.from('projects').select('title, domain').eq('id', project_id).single();

    const templatePath = path.join(process.cwd(), 'public', 'certificate-template.pdf');
    let pdfDoc: PDFDocument;

    if (fs.existsSync(templatePath)) {
      const templateBytes = fs.readFileSync(templatePath);
      pdfDoc = await PDFDocument.load(templateBytes);
    } else {
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([842, 595]);
      page.drawText('Certificate of Completion', { x: 200, y: 500, size: 30, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });
    }

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    firstPage.drawText(student?.name || 'Student', { x: 300, y: height - 200, size: 24, font, color: rgb(0, 0, 0) });
    firstPage.drawText(project?.title || 'Project', { x: 300, y: height - 240, size: 18, font, color: rgb(0, 0, 0) });
    firstPage.drawText(project?.domain || '', { x: 300, y: height - 270, size: 14, font, color: rgb(0, 0, 0) });
    firstPage.drawText(certId, { x: 300, y: height - 300, size: 14, font, color: rgb(0, 0, 0) });
    firstPage.drawText(new Date().toLocaleDateString(), { x: 300, y: height - 330, size: 14, font, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();

    const filePath = `certificates/${certId}.pdf`;
    const { error: uploadError } = await supabase.storage.from('certificates').upload(filePath, pdfBytes, {
      contentType: 'application/pdf',
    });

    if (uploadError) {
      return NextResponse.json({ success: false, error: 'Failed to upload certificate' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(filePath);

    const { error: dbError } = await supabase.from('certificates').insert({
      student_id,
      project_id,
      cert_id: certId,
      pdf_url: urlData.publicUrl,
    });

    if (dbError) {
      return NextResponse.json({ success: false, error: 'Failed to save certificate record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { cert_id: certId } });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

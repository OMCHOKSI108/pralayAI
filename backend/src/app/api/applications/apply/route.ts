import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { applicationSheetName, appendSheetRow, uploadToDrive } from "@/lib/google";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";
import { applicationSchema } from "@/lib/validators";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let payload: unknown;
    let resumeUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      payload = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone") || undefined,
        college: formData.get("college") || undefined,
        gradYear: formData.get("gradYear") || undefined,
        skills: formData.get("skills")
          ? JSON.parse(String(formData.get("skills")))
          : []
      };

      const resume = formData.get("resume");
      if (resume instanceof File) {
        const folderId = process.env.GOOGLE_DRIVE_RESUMES_FOLDER_ID;
        if (!folderId) return withCors(fail("Resume folder is not configured", 500));
        resumeUrl = await uploadToDrive(resume, folderId);
      }
    } else {
      payload = await request.json();
    }

    const parsed = applicationSchema.safeParse(payload);
    if (!parsed.success) return withCors(fail("Validation failed", 400, parsed.error.format()));

    const student = await prisma.studentProfile.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: {
        ...parsed.data,
        email: parsed.data.email.toLowerCase(),
        status: "APPLIED"
      },
      create: {
        ...parsed.data,
        email: parsed.data.email.toLowerCase(),
        status: "APPLIED"
      }
    });

    await appendSheetRow(applicationSheetName(), [
      student.id,
      student.fullName,
      student.email,
      student.phone || "",
      student.college || "",
      student.gradYear || "",
      student.skills.join(", "),
      student.status,
      student.createdAt.toISOString(),
      resumeUrl || ""
    ]);

    return withCors(ok({ studentId: student.id, resumeUrl }, 201));
  } catch (error) {
    console.error("application apply error", error);
    return withCors(fail("Failed to submit application", 500));
  }
}

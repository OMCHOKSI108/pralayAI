import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { syncApplicationToSheet } from "@/lib/admin-sync";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";
import { applicationDecisionSchema } from "@/lib/validators";

export function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["ADMIN", "MANAGEMENT"]);
    if (auth.response) return withCors(auth.response);

    const { id } = await params;
    const parsed = applicationDecisionSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(fail("Validation failed", 400, parsed.error.format()));

    const student = await prisma.studentProfile.update({
      where: { id },
      data: { status: parsed.data.status }
    });

    await syncApplicationToSheet(student);

    return withCors(ok(student));
  } catch (error) {
    console.error("admin application update error", error);
    return withCors(fail("Failed to update application", 500));
  }
}

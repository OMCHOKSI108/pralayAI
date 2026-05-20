import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { syncApplicationToSheet, syncPaymentToSheet } from "@/lib/admin-sync";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";
import { paymentDecisionSchema } from "@/lib/validators";

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
    const parsed = paymentDecisionSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(fail("Validation failed", 400, parsed.error.format()));

    const payment = await prisma.paymentProof.update({
      where: { id },
      data: {
        status: parsed.data.status,
        rejectionReason: parsed.data.status === "FAILED" ? parsed.data.rejectionReason || "" : null,
        approvedAt: parsed.data.status === "SUCCESS" ? new Date() : null
      },
      include: { student: true }
    });

    if (payment.status === "SUCCESS") {
      const student = await prisma.studentProfile.update({
        where: { id: payment.studentId },
        data: { status: "VERIFIED" }
      });
      await syncApplicationToSheet(student);
    }

    await syncPaymentToSheet(payment);

    return withCors(ok(payment));
  } catch (error) {
    console.error("admin payment verify error", error);
    return withCors(fail("Failed to verify payment", 500));
  }
}

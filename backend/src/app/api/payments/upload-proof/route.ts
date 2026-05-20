import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { appendSheetRow, paymentsSheetName, uploadToDrive } from "@/lib/google";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";
import { paymentProofSchema } from "@/lib/validators";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const payload = {
      studentId: formData.get("studentId"),
      amountPaid: formData.get("amountPaid"),
      transactionHash: formData.get("transactionHash")
    };

    const parsed = paymentProofSchema.safeParse(payload);
    if (!parsed.success) return withCors(fail("Validation failed", 400, parsed.error.format()));

    const screenshot = formData.get("screenshot");
    if (!(screenshot instanceof File)) {
      return withCors(fail("Payment screenshot is required", 400));
    }

    const folderId = process.env.GOOGLE_DRIVE_PAYMENTS_FOLDER_ID;
    if (!folderId) return withCors(fail("Payment proof folder is not configured", 500));

    const screenshotUrl = await uploadToDrive(screenshot, folderId);
    const payment = await prisma.paymentProof.create({
      data: {
        studentId: parsed.data.studentId,
        amountPaid: parsed.data.amountPaid,
        transactionHash: parsed.data.transactionHash,
        screenshotUrl,
        status: "REVIEW"
      },
      include: { student: true }
    });

    await appendSheetRow(paymentsSheetName(), [
      payment.id,
      payment.studentId,
      payment.student.fullName,
      payment.amountPaid,
      payment.transactionHash,
      payment.screenshotUrl,
      payment.status,
      "",
      payment.createdAt.toISOString()
    ]);

    return withCors(ok({ paymentId: payment.id, screenshotUrl }, 201));
  } catch (error) {
    console.error("payment proof error", error);
    return withCors(fail("Failed to upload payment proof", 500));
  }
}

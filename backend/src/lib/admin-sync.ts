import { StudentProfile, PaymentProof } from "@prisma/client";
import { applicationSheetName, paymentsSheetName, updateSheetRowById } from "./google";

type PaymentWithStudent = PaymentProof & {
  student: {
    fullName: string;
  };
};

export async function syncApplicationToSheet(student: StudentProfile) {
  try {
    await updateSheetRowById(applicationSheetName(), student.id, [
      student.id,
      student.fullName,
      student.email,
      student.phone || "",
      student.college || "",
      student.gradYear || "",
      student.skills.join(", "),
      student.status,
      student.createdAt.toISOString()
    ]);
  } catch (error) {
    console.error("application sheet sync failed", error);
  }
}

export async function syncPaymentToSheet(payment: PaymentWithStudent) {
  try {
    await updateSheetRowById(paymentsSheetName(), payment.id, [
      payment.id,
      payment.studentId,
      payment.student.fullName,
      payment.amountPaid,
      payment.transactionHash,
      payment.screenshotUrl,
      payment.status,
      payment.rejectionReason || "",
      (payment.approvedAt || payment.createdAt).toISOString()
    ]);
  } catch (error) {
    console.error("payment sheet sync failed", error);
  }
}

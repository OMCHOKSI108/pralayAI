"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readCookieSession } from "@/lib/auth";
import { syncApplicationToSheet, syncPaymentToSheet } from "@/lib/admin-sync";

async function assertAdmin() {
  const session = await readCookieSession();
  if (!session || !["ADMIN", "MANAGEMENT"].includes(session.role)) {
    redirect("/login");
  }
}

export async function updateApplicationStatus(formData: FormData) {
  await assertAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["APPLIED", "APPROVED", "REJECTED", "VERIFIED"].includes(status)) {
    throw new Error("Invalid application update");
  }

  const student = await prisma.studentProfile.update({
    where: { id },
    data: { status: status as "APPLIED" | "APPROVED" | "REJECTED" | "VERIFIED" }
  });

  await syncApplicationToSheet(student);
  revalidatePath("/");
}

export async function verifyPayment(formData: FormData) {
  await assertAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const rejectionReason = String(formData.get("rejectionReason") || "");
  if (!id || !["SUCCESS", "FAILED", "REVIEW", "PENDING"].includes(status)) {
    throw new Error("Invalid payment update");
  }

  const payment = await prisma.paymentProof.update({
    where: { id },
    data: {
      status: status as "SUCCESS" | "FAILED" | "REVIEW" | "PENDING",
      rejectionReason: status === "FAILED" ? rejectionReason : null,
      approvedAt: status === "SUCCESS" ? new Date() : null
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
  revalidatePath("/");
}

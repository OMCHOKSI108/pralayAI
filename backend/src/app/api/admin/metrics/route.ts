import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["ADMIN", "MANAGEMENT"]);
    if (auth.response) return withCors(auth.response);

    const [
      totalStudents,
      totalApplied,
      totalApproved,
      pendingPayments,
      successfulPayments,
      recentApplications,
      recentPayments
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { status: "APPLIED" } }),
      prisma.studentProfile.count({ where: { status: { in: ["APPROVED", "VERIFIED"] } } }),
      prisma.paymentProof.count({ where: { status: { in: ["PENDING", "REVIEW"] } } }),
      prisma.paymentProof.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amountPaid: true },
        _count: true
      }),
      prisma.studentProfile.findMany({
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.paymentProof.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { student: true }
      })
    ]);

    return withCors(
      ok({
        totalStudents,
        totalApplied,
        totalApproved,
        pendingPayments,
        successfulPaymentCount: successfulPayments._count,
        successfulPaymentAmount: successfulPayments._sum.amountPaid || 0,
        recentApplications,
        recentPayments
      })
    );
  } catch (error) {
    console.error("admin metrics error", error);
    return withCors(fail("Failed to load metrics", 500));
  }
}

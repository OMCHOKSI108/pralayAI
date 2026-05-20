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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const payments = await prisma.paymentProof.findMany({
      where:
        status && ["PENDING", "REVIEW", "SUCCESS", "FAILED"].includes(status)
          ? { status: status as "PENDING" | "REVIEW" | "SUCCESS" | "FAILED" }
          : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { student: true }
    });

    return withCors(ok(payments));
  } catch (error) {
    console.error("admin payments list error", error);
    return withCors(fail("Failed to load payments", 500));
  }
}

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

    const applications = await prisma.studentProfile.findMany({
      where:
        status && ["UNREGISTERED", "APPLIED", "APPROVED", "REJECTED", "VERIFIED"].includes(status)
          ? { status: status as "UNREGISTERED" | "APPLIED" | "APPROVED" | "REJECTED" | "VERIFIED" }
          : undefined,
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return withCors(ok(applications));
  } catch (error) {
    console.error("admin applications list error", error);
    return withCors(fail("Failed to load applications", 500));
  }
}

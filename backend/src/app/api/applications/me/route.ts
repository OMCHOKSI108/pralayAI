import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const session = await readSession(request);
    if (!session) return withCors(fail("Unauthorized", 401));

    const profile = await prisma.studentProfile.findFirst({
      where: { OR: [{ userId: session.userId }, { email: session.email }] },
      include: { payments: { orderBy: { createdAt: "desc" } } }
    });

    if (!profile) return withCors(fail("Profile not found", 404));
    return withCors(ok(profile));
  } catch (error) {
    console.error("application me error", error);
    return withCors(fail("Failed to load profile", 500));
  }
}

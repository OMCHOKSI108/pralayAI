import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";
import { registerSchema } from "@/lib/validators";
import type { Role } from "@/lib/auth";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(fail("Validation failed", 400, parsed.error.format()));

    const role = (parsed.data.role || "STUDENT") as Role;
    if (role !== "STUDENT" && parsed.data.adminSetupToken !== process.env.ADMIN_SETUP_TOKEN) {
      return withCors(fail("Admin setup token is invalid", 403));
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role,
        profile:
          role === "STUDENT"
            ? {
                create: {
                  fullName: parsed.data.fullName,
                  email: parsed.data.email.toLowerCase(),
                  status: "UNREGISTERED",
                  skills: []
                }
              }
            : undefined
      },
      select: { id: true, email: true, role: true }
    });

    return withCors(ok(user, 201));
  } catch (error) {
    console.error("register error", error);
    return withCors(fail("Failed to register user", 500));
  }
}

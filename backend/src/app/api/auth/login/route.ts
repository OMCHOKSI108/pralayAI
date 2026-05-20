import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, ok, optionsResponse, withCors } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { setSessionCookie, signSession } from "@/lib/auth";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(fail("Validation failed", 400, parsed.error.format()));

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });
    if (!user) return withCors(fail("Invalid credentials", 401));

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return withCors(fail("Invalid credentials", 401));

    const token = await signSession({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return withCors(ok({ id: user.id, email: user.email, role: user.role, token }));
  } catch (error) {
    console.error("login error", error);
    return withCors(fail("Failed to log in", 500));
  }
}

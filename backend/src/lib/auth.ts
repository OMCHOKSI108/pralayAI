import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { fail } from "./http";

export const SESSION_COOKIE = "hellware_admin_session";

export type Role = "STUDENT" | "ADMIN" | "MANAGEMENT";

type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_PANEL_PASSWORD || "HellWare@D21";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret());
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function readSession(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  const cookieToken = request.cookies.get(SESSION_COOKIE)?.value;
  const token = bearer || cookieToken;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as Role
    };
  } catch {
    return null;
  }
}

export async function readCookieSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as Role
    };
  } catch {
    return null;
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function adminPanelPassword() {
  return process.env.ADMIN_PANEL_PASSWORD || "HellWare@D21";
}

type RequireRoleResult =
  | { session: { userId: string; email: string; role: Role }; response?: never }
  | { response: NextResponse; session?: never };

export async function requireRole(request: NextRequest, roles: Role[]): Promise<RequireRoleResult> {
  const session = await readSession(request);
  if (!session) return { response: fail("Unauthorized", 401) };
  if (!roles.includes(session.role)) return { response: fail("Forbidden", 403) };
  return { session };
}

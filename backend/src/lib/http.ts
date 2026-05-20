import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
}

export function corsHeaders() {
  const origin = (process.env.FRONTEND_ORIGIN || "https://frontend-sooty-gamma-75.vercel.app").replace(/\/$/, "");
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true"
  };
}

export function withCors(response: NextResponse) {
  const headers = corsHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

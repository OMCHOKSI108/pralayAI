import { ok } from "@/lib/http";

export async function GET() {
  return ok({
    status: "OK",
    service: "hellware-backend",
    timestamp: new Date().toISOString()
  });
}

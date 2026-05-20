import { redirect } from "next/navigation";
import { adminPanelPassword, setSessionCookie, signSession } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (password !== adminPanelPassword()) {
    redirect("/login?error=1");
  }

  const token = await signSession({
    sub: "admin-panel",
    email: "admin@hellware.local",
    role: "ADMIN"
  });

  await setSessionCookie(token);
  redirect("/");
}

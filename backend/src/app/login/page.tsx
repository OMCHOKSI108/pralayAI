import { redirect } from "next/navigation";
import { readCookieSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await readCookieSession();
  if (session?.role === "ADMIN" || session?.role === "MANAGEMENT") {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <main className="shell" style={{ display: "grid", placeItems: "center" }}>
      <form
        action="/api/admin/panel-login"
        method="post"
        className="panel"
        style={{ width: "min(100%, 420px)", padding: 28 }}
      >
        <p className="mono" style={{ color: "var(--accent)", fontSize: 12, letterSpacing: 1 }}>
          HELLWARE ADMIN ACCESS
        </p>
        <h1 style={{ margin: "8px 0 10px", fontSize: 32 }}>Login</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.5, marginBottom: 22 }}>
          Enter the admin panel password to view application and payment records.
        </p>

        <label className="mono" htmlFor="password" style={{ display: "block", fontSize: 12, marginBottom: 8 }}>
          PASSWORD
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          style={{
            width: "100%",
            padding: "13px 14px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--panel-2)",
            color: "var(--text)"
          }}
        />

        {params.error ? (
          <p style={{ color: "var(--accent)", fontSize: 13, marginTop: 12 }}>Wrong password.</p>
        ) : null}

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: 18,
            padding: "13px 16px",
            borderRadius: 8,
            border: 0,
            background: "var(--accent)",
            color: "white",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Open Admin Panel
        </button>
      </form>
    </main>
  );
}

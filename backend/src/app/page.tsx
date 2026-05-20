import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readCookieSession } from "@/lib/auth";
import { updateApplicationStatus, verifyPayment } from "./actions";

export const dynamic = "force-dynamic";

async function loadDashboardData() {
  try {
    const [
      totalStudents,
      appliedStudents,
      approvedStudents,
      rejectedStudents,
      verifiedStudents,
      pendingPayments,
      successfulPayments,
      applications,
      payments
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { status: "APPLIED" } }),
      prisma.studentProfile.count({ where: { status: "APPROVED" } }),
      prisma.studentProfile.count({ where: { status: "REJECTED" } }),
      prisma.studentProfile.count({ where: { status: "VERIFIED" } }),
      prisma.paymentProof.count({ where: { status: { in: ["PENDING", "REVIEW"] } } }),
      prisma.paymentProof.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amountPaid: true },
        _count: true
      }),
      prisma.studentProfile.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      }),
      prisma.paymentProof.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { student: true }
      })
    ]);

    return {
      error: null,
      metrics: [
        ["Students", totalStudents],
        ["Applied", appliedStudents],
        ["Approved", approvedStudents],
        ["Rejected", rejectedStudents],
        ["Verified", verifiedStudents],
        ["Pending Payments", pendingPayments],
        ["Payment Count", successfulPayments._count],
        ["Payment Total", `INR ${successfulPayments._sum.amountPaid || 0}`]
      ],
      applications,
      payments
    };
  } catch (error) {
    console.error("admin dashboard load error", error);
    return {
      error: "Database is not ready yet. Check DATABASE_URL and run Prisma migrations.",
      metrics: [],
      applications: [],
      payments: []
    };
  }
}

function setupHealth() {
  return [
    ["Database", Boolean(process.env.DATABASE_URL)],
    ["Google Sheets", Boolean(process.env.GOOGLE_SHEETS_ID)],
    [
      "Google Auth",
      Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) ||
        Boolean(
          process.env.GOOGLE_OAUTH_CLIENT_ID &&
            process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
            process.env.GOOGLE_OAUTH_REFRESH_TOKEN
        )
    ],
    ["Resume Folder", Boolean(process.env.GOOGLE_DRIVE_RESUMES_FOLDER_ID)],
    ["Payment Folder", Boolean(process.env.GOOGLE_DRIVE_PAYMENTS_FOLDER_ID)]
  ] as const;
}

export default async function AdminHome() {
  const session = await readCookieSession();
  if (!session || !["ADMIN", "MANAGEMENT"].includes(session.role)) {
    redirect("/login");
  }

  const dashboard = await loadDashboardData();
  const health = setupHealth();

  return (
    <main className="shell">
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <header className="admin-header">
          <div>
            <p className="mono eyebrow">HELLWARE SERVERLESS CONTROL</p>
            <h1 className="page-title">Admin Panel</h1>
            <p className="muted max-copy">
              Manage applications, payment proof reviews, Google Sheets mirrors, and database state from one console.
            </p>
          </div>

          <form action="/api/admin/logout" method="post">
            <button type="submit" className="ghost-button mono">
              LOG OUT
            </button>
          </form>
        </header>

        {dashboard.error ? <div className="notice">{dashboard.error}</div> : null}

        <section className="health-grid">
          {health.map(([label, ready]) => (
            <div key={label} className="panel metric-card">
              <span className="mono metric-label">{label}</span>
              <strong className={ready ? "status-ok" : "status-warn"}>{ready ? "READY" : "MISSING"}</strong>
            </div>
          ))}
        </section>

        <section className="metrics-grid">
          {dashboard.metrics.map(([label, value]) => (
            <div key={label} className="panel metric-card">
              <span className="mono metric-label">{label}</span>
              <strong className="metric-value">{value}</strong>
            </div>
          ))}
        </section>

        <section className="panel data-panel">
          <div className="section-head">
            <div>
              <h2>Applications</h2>
              <p className="muted">Approve, reject, or verify student applications. Updates sync to Sheets when configured.</p>
            </div>
            <span className="mono count-pill">{dashboard.applications.length} ROWS</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Grad</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.applications.map((student) => (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.college || "-"}</td>
                    <td>{student.gradYear || "-"}</td>
                    <td>{student.skills.join(", ") || "-"}</td>
                    <td>
                      <span className="status-pill">{student.status}</span>
                    </td>
                    <td>{student.createdAt.toLocaleDateString()}</td>
                    <td>
                      <form action={updateApplicationStatus} className="inline-form">
                        <input type="hidden" name="id" value={student.id} />
                        <select name="status" defaultValue={student.status} aria-label="Application status">
                          <option value="APPLIED">APPLIED</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                        </select>
                        <button type="submit">Update</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {dashboard.applications.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No applications yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel data-panel">
          <div className="section-head">
            <div>
              <h2>Payment Proofs</h2>
              <p className="muted">Open screenshots, approve valid transactions, or mark failed with a reason.</p>
            </div>
            <span className="mono count-pill">{dashboard.payments.length} ROWS</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Tx Hash</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.student.fullName}</td>
                    <td>{payment.student.email}</td>
                    <td>INR {payment.amountPaid}</td>
                    <td>{payment.transactionHash}</td>
                    <td>
                      <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-link">
                        Open
                      </a>
                    </td>
                    <td>
                      <span className="status-pill">{payment.status}</span>
                    </td>
                    <td>{payment.rejectionReason || "-"}</td>
                    <td>
                      <form action={verifyPayment} className="stack-form">
                        <input type="hidden" name="id" value={payment.id} />
                        <div className="inline-form">
                          <select name="status" defaultValue={payment.status} aria-label="Payment status">
                            <option value="REVIEW">REVIEW</option>
                            <option value="PENDING">PENDING</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                          <button type="submit">Save</button>
                        </div>
                        <input
                          name="rejectionReason"
                          defaultValue={payment.rejectionReason || ""}
                          placeholder="Reason if failed"
                        />
                      </form>
                    </td>
                  </tr>
                ))}
                {dashboard.payments.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No payment proofs yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

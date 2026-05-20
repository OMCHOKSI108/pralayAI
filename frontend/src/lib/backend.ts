const DEFAULT_BACKEND_URL = "https://hellware-c9ad.vercel.app";

export const backendUrl =
  (process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

type BackendResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as BackendResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Backend request failed");
  }
  return payload.data as T;
}

export async function submitBackendApplication(input: {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  gradYear: string;
  skills: string[];
  resume?: File | null;
}) {
  if (input.resume) {
    const formData = new FormData();
    formData.set("fullName", input.fullName);
    formData.set("email", input.email);
    formData.set("phone", input.phone);
    formData.set("college", input.college);
    formData.set("gradYear", input.gradYear);
    formData.set("skills", JSON.stringify(input.skills));
    formData.set("resume", input.resume);

    const response = await fetch(`${backendUrl}/api/applications/apply`, {
      method: "POST",
      body: formData
    });
    return parseResponse<{ studentId: string; resumeUrl: string | null }>(response);
  }

  const response = await fetch(`${backendUrl}/api/applications/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return parseResponse<{ studentId: string; resumeUrl: string | null }>(response);
}

export async function uploadBackendPaymentProof(input: {
  studentId: string;
  amountPaid: number;
  transactionHash: string;
  screenshot: File;
}) {
  const formData = new FormData();
  formData.set("studentId", input.studentId);
  formData.set("amountPaid", String(input.amountPaid));
  formData.set("transactionHash", input.transactionHash);
  formData.set("screenshot", input.screenshot);

  const response = await fetch(`${backendUrl}/api/payments/upload-proof`, {
    method: "POST",
    body: formData
  });
  return parseResponse<{ paymentId: string; screenshotUrl: string }>(response);
}

// ─── Auth ───────────────────────────────────────────────────────

export async function loginBackend(email: string, password: string) {
  const response = await fetch(`${backendUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return parseResponse<{ id: string; email: string; role: string; token: string }>(response);
}

export async function registerBackend(input: {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  adminSetupToken?: string;
}) {
  const response = await fetch(`${backendUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return parseResponse<{ id: string; email: string; role: string }>(response);
}

// ─── Admin ──────────────────────────────────────────────────────

export async function getBackendMetrics(token: string) {
  const response = await fetch(`${backendUrl}/api/admin/metrics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return parseResponse<{
    totalStudents: number;
    totalApplied: number;
    totalApproved: number;
    pendingPayments: number;
    successfulPaymentCount: number;
    successfulPaymentAmount: number;
    recentApplications: Array<{
      id: string; fullName: string; email: string; phone: string | null;
      college: string | null; gradYear: string | null; skills: string[];
      status: string; createdAt: string;
    }>;
    recentPayments: Array<Record<string, unknown>>;
  }>(response);
}

export async function getBackendApplications(token: string, status?: string) {
  const url = status
    ? `${backendUrl}/api/admin/applications?status=${status}`
    : `${backendUrl}/api/admin/applications`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return parseResponse<Array<{
    id: string; fullName: string; email: string; phone: string | null;
    college: string | null; gradYear: string | null; skills: string[];
    status: string; createdAt: string;
  }>>(response);
}

export async function updateBackendApplication(token: string, id: string, status: string) {
  const response = await fetch(`${backendUrl}/api/admin/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return parseResponse<Record<string, unknown>>(response);
}

// ─── Student ────────────────────────────────────────────────────

export async function getMyBackendApplication(token: string) {
  const response = await fetch(`${backendUrl}/api/applications/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return parseResponse<Record<string, unknown>>(response);
}

// ─── Payments ──────────────────────────────────────────────────

export async function getBackendPayments(token: string, status?: string) {
  const url = status
    ? `${backendUrl}/api/admin/payments?status=${status}`
    : `${backendUrl}/api/admin/payments`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return parseResponse<Array<{
    id: string; studentId: string; amountPaid: number;
    transactionHash: string; screenshotUrl: string;
    status: string; rejectionReason: string | null;
    createdAt: string; approvedAt: string | null;
    student: { fullName: string; email: string };
  }>>(response);
}

export async function verifyBackendPayment(token: string, id: string, status: string, rejectionReason?: string) {
  const response = await fetch(`${backendUrl}/api/admin/payments/${id}/verify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status, rejectionReason })
  });
  return parseResponse<Record<string, unknown>>(response);
}

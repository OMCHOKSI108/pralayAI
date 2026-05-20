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

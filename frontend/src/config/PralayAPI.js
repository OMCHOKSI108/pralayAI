/** @typedef {"idle"|"sending"|"streaming"|"done"|"error"|"stopped"} MessageStatus */
/** @typedef {{id:string,role:"user"|"assistant",content:string,timestamp:string,status?:MessageStatus}} ChatMessage */
/** @typedef {{id:string,title:string,created_at:string,updated_at:string}} Conversation */
/** @typedef {{id:string,title:string,created_at:string,updated_at:string,messages:ChatMessage[]}} ConversationDetail */

const API_BASE_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("pralayai_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(username, email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function logout() {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
}

export async function getMe() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function resolveResetToken(token) {
  const res = await fetch(`${API_BASE_URL}/api/auth/resolve-reset-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid reset link");
  }
  return res.json();
}

export async function sendResetOtp(email) {
  const res = await fetch(`${API_BASE_URL}/api/auth/send-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send OTP");
  }
  return res.json();
}

export async function verifyReset(email, new_password, otp) {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, new_password, otp }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Verification failed");
  }
  return res.json();
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Password change failed");
  }
  return res.json();
}

export async function updateProfile(username) {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Profile update failed");
  }
  return res.json();
}

// ── Chat (full JSON fallback) ─────────────────────────────────────────────────

export default async function runChat(prompt, conversationId = null) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      message: prompt,
      conversation_id: conversationId,
      max_new_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired. Please log in again.");
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Backend error ${res.status}`);
  }
  return res.json();
}

// ── Streaming chat (enhanced with events) ────────────────────────────────────

/**
 * @param {{
 *   message: string,
 *   conversationId?: string|null,
 *   signal?: AbortSignal,
 *   max_new_tokens?: number,
 *   temperature?: number,
 *   top_p?: number,
 *   skill_override?: string|null,
 *   onEvent: (event: {type: string, data: any}) => void,
 *   onToken: (token: string) => void,
 *   onDone: (result: {conversationId?: string, stopped?: boolean, assistant_message_id?: string, status?: string}) => void,
 *   onError: (err: Error) => void,
 * }} opts
 */
export async function streamChat({
  message,
  conversationId = null,
  signal,
  max_new_tokens = 300,
  temperature = 0.7,
  top_p = 0.9,
  skill_override = null,
  onEvent,
  onToken,
  onDone,
  onError,
}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        max_new_tokens,
        temperature,
        top_p,
        skill_override,
      }),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      onDone?.({ stopped: true });
    } else {
      onError?.(new Error("Cannot reach backend. Is the server running?"));
    }
    return;
  }

  if (!res.ok) {
    if (res.status === 401) {
      onError?.(new Error("Session expired. Please log in again."));
      return;
    }
    const err = await res.json().catch(() => ({}));
    onError?.(new Error(err.detail || `Backend error ${res.status}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let resolvedConversationId = conversationId;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith(":")) continue;
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);

        if (data === "[DONE]") {
          onDone?.({ conversationId: resolvedConversationId });
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const eventType = parsed.type || "delta";

          if (eventType === "conversation" && parsed.conversation_id) {
            resolvedConversationId = parsed.conversation_id;
          }

          if (eventType === "error") {
            onError?.(new Error(parsed.error || "Unknown error"));
            return;
          }

          if (eventType === "done") {
            onDone?.({
              conversationId: parsed.conversation_id || resolvedConversationId,
              assistant_message_id: parsed.assistant_message_id,
              status: parsed.status,
            });
            return;
          }

          if (eventType === "delta" && parsed.delta) {
            onToken?.(parsed.delta);
          }

          onEvent?.({
            type: eventType,
            data: parsed,
          });
        } catch {
          if (data) onToken?.(data);
        }
      }
    }
    onDone?.({ conversationId: resolvedConversationId });
  } catch (err) {
    if (err.name === "AbortError") {
      onDone?.({ conversationId: resolvedConversationId, stopped: true });
    } else {
      onError?.(err);
    }
  } finally {
    reader.releaseLock();
  }
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations() {
  const res = await fetch(`${API_BASE_URL}/api/conversations`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return [];
  return res.json();
}

/** @returns {Promise<ConversationDetail|null>} */
export async function getConversation(id) {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteConversation(id) {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Delete failed");
  }
  return res.json();
}

// ── Memory ────────────────────────────────────────────────────────────────────

export async function getMemories() {
  const res = await fetch(`${API_BASE_URL}/api/memory`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return { memories: [], total: 0 };
  return res.json();
}

export async function addMemory(key, value, type = "fact") {
  const res = await fetch(`${API_BASE_URL}/api/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ key, value, type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to save memory");
  }
  return res.json();
}

export async function updateMemory(memoryId, updates) {
  const res = await fetch(`${API_BASE_URL}/api/memory/${memoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update memory");
  }
  return res.json();
}

export async function deleteMemory(memoryId) {
  const res = await fetch(`${API_BASE_URL}/api/memory/${memoryId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) return false;
  return res.json();
}

export async function clearMemories() {
  const res = await fetch(`${API_BASE_URL}/api/memory`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) return false;
  return res.json();
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function getDocuments() {
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return { documents: [], total: 0 };
  return res.json();
}

export async function deleteDocument(documentId) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) return false;
  return res.json();
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

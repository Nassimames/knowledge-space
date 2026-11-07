import { createClient } from "@/lib/supabase/client";
import type {
  ChatRequest,
  ChatResponse,
  ConversationDetail,
  ConversationPage,
} from "@/types/chat";
import type { DocumentPage, DocumentResponse } from "@/types/documents";
import type { HealthResponse } from "@/types/health";

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return baseUrl.replace(/\/$/, "");
}

async function responseError(response: Response): Promise<Error> {
  let message = `Request failed with status ${response.status}.`;

  try {
    const body = await response.json();
    if (body && typeof body.detail === "string") {
      message = body.detail;
    }
  } catch {
    // Keep the status-based message for non-JSON responses.
  }

  return new Error(message);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await responseError(response);
  }

  return response.json() as Promise<T>;
}

function redirectToLogin(): never {
  window.location.replace("/login");
  throw new Error("Your session has expired. Please sign in again.");
}

async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Unable to retrieve your authentication session: ${error.message}`);
  }

  if (!data.session) {
    return redirectToLogin();
  }

  const sendRequest = (accessToken: string) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);

    return fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
    });
  };

  const response = await sendRequest(data.session.access_token);

  if (response.status !== 401) {
    return response;
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError || !refreshed.session) {
    return redirectToLogin();
  }

  const retryResponse = await sendRequest(refreshed.session.access_token);

  if (retryResponse.status === 401) {
    return redirectToLogin();
  }

  return retryResponse;
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/health`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Backend health check failed with ${response.status}.`);
  }

  return response.json() as Promise<HealthResponse>;
}

export async function fetchDocuments(
  signal?: AbortSignal,
  pagination: { limit?: number; offset?: number } = {},
): Promise<DocumentPage> {
  const searchParams = new URLSearchParams({
    limit: String(pagination.limit ?? 20),
    offset: String(pagination.offset ?? 0),
  });
  const response = await authenticatedFetch(`/api/documents?${searchParams.toString()}`, {
    cache: "no-store",
    signal,
  });

  return handleResponse<DocumentPage>(response);
}

export async function uploadDocument(file: File, signal?: AbortSignal): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authenticatedFetch("/api/documents", {
    method: "POST",
    body: formData,
    signal,
  });

  return handleResponse<DocumentResponse>(response);
}

export async function deleteDocument(documentId: string, signal?: AbortSignal): Promise<void> {
  const response = await authenticatedFetch(`/api/documents/${documentId}`, {
    method: "DELETE",
    signal,
  });

  if (!response.ok) {
    throw await responseError(response);
  }
}

export async function downloadDocument(documentId: string, signal?: AbortSignal): Promise<Blob> {
  const response = await authenticatedFetch(`/api/documents/${documentId}/download`, {
    signal,
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  return response.blob();
}

export async function fetchConversations(signal?: AbortSignal): Promise<ConversationPage> {
  const response = await authenticatedFetch("/api/chat/conversations?limit=50&offset=0", {
    cache: "no-store",
    signal,
  });

  return handleResponse<ConversationPage>(response);
}

export async function fetchConversation(
  conversationId: string,
  signal?: AbortSignal,
): Promise<ConversationDetail> {
  const response = await authenticatedFetch(
    `/api/chat/conversations/${encodeURIComponent(conversationId)}`,
    { cache: "no-store", signal },
  );

  return handleResponse<ConversationDetail>(response);
}

export async function sendChatMessage(
  request: ChatRequest,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const response = await authenticatedFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  return handleResponse<ChatResponse>(response);
}

import "server-only";
import { getConfig } from "@/lib/config";
import { env } from "@/lib/env";

export type Validation = Record<string, { type?: string; message?: string }>;

/**
 * Every non-2xx response from Nuvion has the same shape: { status: "error", type, message, validations? }.
 * Branch on `type`, never on `message`.
 */
export class NuvionError extends Error {
  constructor(
    readonly httpStatus: number,
    readonly type: string,
    message: string,
    readonly validations: Validation[] = [],
  ) {
    super(message);
    this.name = "NuvionError";
  }

  get summary(): string {
    const first = this.validations[0];
    if (!first) return this.message;
    const [field, detail] = Object.entries(first)[0] ?? [];
    return field && detail?.message ? `${field}: ${detail.message}` : this.message;
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/** Calls the Nuvion API with the visitor's own key and returns the unwrapped `data`. Server-only: the key never reaches the browser. */
export async function nuvion<T>(method: Method, path: string, body?: unknown): Promise<T> {
  return nuvionAs<T>((await getConfig()).apiKey, method, path, body);
}

/** Same call with an explicit key, for the Settings page while the visitor is still connecting. */
export async function nuvionAs<T>(apiKey: string, method: Method, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      // Cloudflare in front of the API blocks the default user agents of many HTTP libraries (Python's, for one).
      "User-Agent": "nuvion-webhook-inspector/0.1 (+https://docs.nuvion.co)",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new NuvionError(res.status, "error_invalid_response", `Nuvion returned a non-JSON response (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    const e = json as { type?: string; message?: string; validations?: Validation[] };
    throw new NuvionError(res.status, e.type ?? "error_unknown", e.message ?? `Request failed with HTTP ${res.status}.`, e.validations);
  }
  return (json as { data: T }).data;
}

/* ---------- Types: only the fields this app reads ---------- */

/** Lists come back as { data: { data: [...], meta } }, so after unwrapping they sit under `data`. */
export interface List<T> {
  data: T[];
  meta: { pagination: { has_next: boolean; next_cursor: string | null } };
}

export interface Webhook {
  id: string;
  url: string;
  description?: string;
  status?: string;
  /** Present only in the response that creates the webhook or rotates its secret. */
  secret?: string;
  created: number;
}

export interface WebhookLog {
  id: string;
  event_id: string;
  entity_webhook_id: string;
  url: string;
  request: { headers: Record<string, string>; body: unknown };
  response: { data?: unknown; status?: number };
  duration: { request_sent: number; response_received: number };
  created: number;
}

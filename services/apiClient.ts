import type { ApiError, ApiErrorCode } from '@/types';

/**
 * The only place the app talks HTTP.
 *
 * The base URL comes from `EXPO_PUBLIC_API_BASE_URL`, which Expo inlines at
 * build time — public by definition, so it must never carry a secret. In
 * production it is an HTTPS origin; during development it is whatever host
 * the device can actually reach (a phone cannot see the computer's
 * `localhost`).
 *
 * The client never logs request bodies or authorization headers, and it
 * turns every failure into an `ApiError` with a message safe to show a
 * student. Raw server or transport text never reaches a screen.
 */

const DEFAULT_TIMEOUT_MS = 12_000;

/** Public configuration: an origin only, never a credential. */
export function apiBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, '');
}

/** True when this build has a campus backend to talk to. */
export function isApiConfigured(): boolean {
  return apiBaseUrl() !== null;
}

const MESSAGES: Record<ApiErrorCode, string> = {
  NETWORK_ERROR: 'We could not reach the campus service. Check your connection and try again.',
  VALIDATION_ERROR: 'Some details were rejected. Check the report and try again.',
  UNAUTHENTICATED: 'Your session has ended. Sign in again to continue.',
  FORBIDDEN: 'This account is not allowed to do that.',
  NOT_FOUND: 'That record is no longer available.',
  RATE_LIMITED: 'Too many attempts in a row. Wait a moment and try again.',
  SERVER_ERROR: 'The campus service had a problem. Your report is safe on this device.',
  UNKNOWN_ERROR: 'Something went wrong. Your report is safe on this device.',
};

export function apiError(
  code: ApiErrorCode,
  overrides: Partial<Omit<ApiError, 'code'>> = {},
): ApiError {
  return { code, message: MESSAGES[code], ...overrides };
}

function codeForStatus(status: number): ApiErrorCode {
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHENTICATED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN_ERROR';
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Sent as `Idempotency-Key` so a retried write cannot create two records */
  idempotencyKey?: string;
  /** Short-lived credential for authenticated calls */
  accessToken?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/**
 * Performs a request and always answers with a result object. Callers decide
 * what a failure means for their screen; nothing here throws.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const base = apiBaseUrl();
  if (!base) return { ok: false, error: apiError('NETWORK_ERROR', { message: MESSAGES.NETWORK_ERROR }) };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort);

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
    if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

    const response = await fetch(`${base}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, error: apiError(codeForStatus(response.status), { status: response.status }) };
    }

    if (response.status === 204) return { ok: true, data: undefined as T };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    // Aborts, DNS failures, TLS problems and offline devices all land here.
    // None of them is the student's fault, and none of them is a success.
    return { ok: false, error: apiError('NETWORK_ERROR') };
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

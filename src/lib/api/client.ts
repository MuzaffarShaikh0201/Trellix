import { parseRetryAfter } from "@/lib/api/retryAfter";
import { postSessionRefresh } from "@/lib/api/session-refresh";
import { notifySessionExpired } from "@/lib/auth/session-expired";
import {
	clearAuthSession,
	getStoredAccessToken,
	readAuthSession,
	setAuthSession,
} from "@/lib/auth/storage";
import { getApiBaseUrl } from "@/lib/config";
import { ApiError } from "@/types/api";

/**
 * - renewed: a newer access token is stored (by this call or by another tab).
 * - rejected: the server refused the refresh token; the session is over.
 * - unavailable: rate-limited, offline or a server error; try again later, stay signed in.
 */
type RefreshOutcome = "renewed" | "rejected" | "unavailable";

/** Coalesces concurrent refreshes in this tab into one request. */
let refreshInFlight: Promise<RefreshOutcome> | null = null;

/**
 * Refresh tokens rotate: each one works once. Tabs share localStorage, so a lock stops two
 * tabs from spending the same refresh token. Falls back to no lock where unsupported.
 */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
	if (typeof navigator !== "undefined" && "locks" in navigator) {
		return navigator.locks.request("trellix-session-refresh", fn);
	}
	return fn();
}

/** @param staleAccessToken The token the caller found wanting; if storage holds a different one, it was already renewed. */
function refreshStoredSession(staleAccessToken: string | null, signal?: AbortSignal): Promise<RefreshOutcome> {
	return withRefreshLock(async () => {
		const stored = readAuthSession();
		if (!stored) return "rejected";
		if (stored.access_token !== staleAccessToken) return "renewed";
		try {
			setAuthSession(await postSessionRefresh(stored.refresh_token, signal, stored.access_token));
			return "renewed";
		} catch (err) {
			// Another tab without lock support may have rotated the token meanwhile.
			if (getStoredAccessToken() !== stored.access_token) return "renewed";
			return err instanceof ApiError && err.status === 401 ? "rejected" : "unavailable";
		}
	});
}

function refreshSessionOnce(staleAccessToken: string | null, signal?: AbortSignal): Promise<RefreshOutcome> {
	if (!refreshInFlight) {
		refreshInFlight = refreshStoredSession(staleAccessToken, signal).finally(() => {
			refreshInFlight = null;
		});
	}
	return refreshInFlight;
}

/**
 * Renews the session while the access token is still valid. Only signs out if the server
 * rejects the refresh token; other failures are retried by the caller.
 */
export async function renewSessionEarly(): Promise<boolean> {
	const outcome = await refreshSessionOnce(getStoredAccessToken());
	if (outcome === "rejected") endSession();
	return outcome === "renewed";
}

function endSession() {
	clearAuthSession();
	notifySessionExpired();
}

type SearchParamsInput = Record<
	string,
	string | number | boolean | undefined | null
>;

type FormInput = Record<string, string | number | boolean | undefined | null>;

export type ApiRequestOptions = {
	method?: string;
	searchParams?: SearchParamsInput;
	/** When true (default), send `Authorization: Bearer` if an access token exists. */
	auth?: boolean;
	signal?: AbortSignal;
	headers?: HeadersInit;
	json?: unknown;
	form?: FormInput;
	body?: BodyInit | null;
};

function buildUrl(path: string, searchParams?: SearchParamsInput): string {
	const base = getApiBaseUrl();
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const href =
		base !== ""
			? `${base}${normalizedPath}`
			: `${window.location.origin}${normalizedPath}`;
	const url = new URL(href);
	if (searchParams) {
		for (const [key, value] of Object.entries(searchParams)) {
			if (value != null && value !== "") {
				url.searchParams.set(key, String(value));
			}
		}
	}
	return url.toString();
}

async function parseJsonSafe(res: Response): Promise<unknown> {
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

/**
 * Typed fetch helper for the Trellix API. Throws {@link ApiError} on non-OK responses.
 */
export async function apiRequest<T>(
	path: string,
	options: ApiRequestOptions = {},
): Promise<T> {
	const {
		method = "GET",
		searchParams,
		auth = true,
		signal,
		headers: requestHeaders,
		json,
		form,
		body: rawBody,
	} = options;
	const url = buildUrl(path, searchParams);

	const headers = new Headers(requestHeaders);
	headers.set("Accept", "application/json");
	const sentToken = auth ? getStoredAccessToken() : null;
	if (sentToken) headers.set("Authorization", `Bearer ${sentToken}`);

	let requestBody: BodyInit | null | undefined = rawBody;
	if (json !== undefined) {
		headers.set("Content-Type", "application/json");
		requestBody = JSON.stringify(json);
	} else if (form !== undefined) {
		headers.set("Content-Type", "application/x-www-form-urlencoded");
		const encoded = new URLSearchParams();
		for (const [key, value] of Object.entries(form)) {
			if (value != null) {
				encoded.set(key, String(value));
			}
		}
		requestBody = encoded.toString();
	}

	let res = await fetch(url, { method, headers, body: requestBody, signal });

	if (res.status === 401 && auth) {
		const outcome = await refreshSessionOnce(sentToken, signal);
		const token = getStoredAccessToken();
		if (outcome === "renewed" && token) {
			headers.set("Authorization", `Bearer ${token}`);
			res = await fetch(url, { method, headers, body: requestBody, signal });
			if (res.status === 401) endSession();
		} else if (outcome === "rejected") {
			endSession();
		}
		// "unavailable": keep the session and let this request fail; the next one retries.
	}

	if (!res.ok) {
		const errorBody = await parseJsonSafe(res);
		const retryAfter = res.status === 429 ? parseRetryAfter(res.headers.get("Retry-After"), errorBody) : null;
		throw new ApiError(res.status, errorBody, undefined, retryAfter);
	}

	if (res.status === 204) return undefined as T;

	const responseBody = await parseJsonSafe(res);
	return responseBody as T;
}

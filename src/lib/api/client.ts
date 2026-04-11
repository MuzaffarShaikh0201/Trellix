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

/** Coalesces concurrent 401 recoveries into a single refresh. */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshStoredSession(signal?: AbortSignal): Promise<boolean> {
	const stored = readAuthSession();
	if (!stored?.refresh_token) {
		clearAuthSession();
		return false;
	}
	try {
		const session = await postSessionRefresh(stored.refresh_token, signal);
		setAuthSession(session);
		return true;
	} catch {
		clearAuthSession();
		return false;
	}
}

function refreshSessionOnce(signal?: AbortSignal): Promise<boolean> {
	if (!refreshInFlight) {
		refreshInFlight = refreshStoredSession(signal).finally(() => {
			refreshInFlight = null;
		});
	}
	return refreshInFlight;
}

type SearchParamsInput = Record<
	string,
	string | number | boolean | undefined | null
>;

export type ApiRequestOptions = {
	method?: string;
	searchParams?: SearchParamsInput;
	/** When true (default), send `Authorization: Bearer` if an access token exists. */
	auth?: boolean;
	signal?: AbortSignal;
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
	const { method = "GET", searchParams, auth = true, signal } = options;
	const url = buildUrl(path, searchParams);

	const headers = new Headers();
	headers.set("Accept", "application/json");
	if (auth) {
		const token = getStoredAccessToken();
		if (token) headers.set("Authorization", `Bearer ${token}`);
	}

	let res = await fetch(url, { method, headers, signal });

	if (res.status === 401 && auth) {
		const recovered = await refreshSessionOnce(signal);
		if (recovered) {
			const token = getStoredAccessToken();
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
				res = await fetch(url, { method, headers, signal });
			}
		}
	}

	if (res.status === 401 && auth) {
		clearAuthSession();
		notifySessionExpired();
	}

	if (!res.ok) {
		const body = await parseJsonSafe(res);
		throw new ApiError(res.status, body);
	}

	if (res.status === 204) return undefined as T;

	const body = await parseJsonSafe(res);
	return body as T;
}

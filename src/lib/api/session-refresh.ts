import { getApiBaseUrl } from "@/lib/config";
import { ApiError } from "@/types/api";
import type { AuthSession } from "@/types/auth";

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
 * POST `/refresh` with `refresh_token` as form-urlencoded payload.
 * Optionally includes `Authorization` with the previous access token when provided.
 */
export async function postSessionRefresh(
	refreshToken: string,
	signal?: AbortSignal,
	accessToken?: string,
): Promise<AuthSession> {
	const base = getApiBaseUrl();
	const normalizedPath = "/refresh";
	const href =
		base !== ""
			? `${base}${normalizedPath}`
			: `${window.location.origin}${normalizedPath}`;
	const headers = new Headers();
	headers.set("Accept", "application/json");
	headers.set("Content-Type", "application/x-www-form-urlencoded");
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}

	const form = new URLSearchParams();
	form.set("refresh_token", refreshToken);

	const res = await fetch(href, {
		method: "POST",
		headers,
		body: form.toString(),
		signal,
	});

	if (!res.ok) {
		const body = await parseJsonSafe(res);
		throw new ApiError(res.status, body);
	}

	const body = await parseJsonSafe(res);
	return body as AuthSession;
}

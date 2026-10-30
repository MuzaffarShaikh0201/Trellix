const UNIT_SECONDS: Record<string, number> = { second: 1, minute: 60, hour: 3600 };

/**
 * Seconds to wait after a 429. Reads the `Retry-After` header (seconds or an HTTP date)
 * and falls back to the API message, e.g. "Too many requests. Try again in 14 minutes."
 * The header is only readable when the API lists it in `Access-Control-Expose-Headers`.
 */
export function parseRetryAfter(header: string | null, body: unknown, now = Date.now()): number | null {
	if (header) {
		const trimmed = header.trim();
		if (/^\d+$/.test(trimmed)) return Number(trimmed);
		const at = Date.parse(trimmed);
		if (!Number.isNaN(at)) return Math.max(0, Math.ceil((at - now) / 1000));
	}
	const detail =
		typeof body === "object" && body !== null && "detail" in body ? (body as { detail: unknown }).detail : null;
	if (typeof detail !== "string") return null;
	const m = /in (\d+|an?|one) (second|minute|hour)s?\b/i.exec(detail);
	if (!m) return null;
	const n = /^\d+$/.test(m[1]) ? Number(m[1]) : 1;
	return n * UNIT_SECONDS[m[2].toLowerCase()];
}

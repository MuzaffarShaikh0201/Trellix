/**
 * Base URL for the Trellix API (no trailing slash).
 * Set `VITE_API_URL` in `.env` (see `.env.example`). No other default is applied.
 */
export function getApiBaseUrl(): string {
	const raw = import.meta.env.VITE_API_URL as string | undefined;
	return raw?.trim().replace(/\/$/, "") ?? "";
}

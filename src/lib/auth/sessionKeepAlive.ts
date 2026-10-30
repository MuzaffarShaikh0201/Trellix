import { renewSessionEarly } from "@/lib/api/client";
import { getStoredAccessToken } from "@/lib/auth/storage";

/** Renew this long before the access token expires. */
const RENEW_BEFORE_MS = 60_000;
/** setTimeout can't wait longer than ~24.8 days. */
const MAX_DELAY_MS = 2_147_000_000;

/** Expiry of a JWT access token in ms since epoch, or null if it can't be read. */
export function tokenExpiresAt(token: string | null): number | null {
	if (!token) return null;
	try {
		const payload = token.split(".")[1];
		if (!payload) return null;
		const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		const exp = (JSON.parse(json) as { exp?: unknown }).exp;
		return typeof exp === "number" ? exp * 1000 : null;
	} catch {
		return null;
	}
}

/** How long to wait before renewing: 0 means now, null means don't schedule. */
export function renewDelay(token: string | null, now = Date.now()): number | null {
	const exp = tokenExpiresAt(token);
	if (exp === null) return null;
	return Math.min(MAX_DELAY_MS, Math.max(0, exp - RENEW_BEFORE_MS - now));
}

/**
 * Keeps the session alive by renewing the access token shortly before it expires,
 * and again when the tab becomes visible (timers pause while a laptop sleeps).
 * Works across tabs because the token is re-read from storage every time.
 * Returns a cleanup function.
 */
export function startSessionKeepAlive(): () => void {
	let timer: number | undefined;
	let stopped = false;

	const check = () => {
		window.clearTimeout(timer);
		if (stopped) return;
		const delay = renewDelay(getStoredAccessToken());
		if (delay === null) return;
		if (delay > 0) {
			timer = window.setTimeout(check, delay);
			return;
		}
		void renewSessionEarly().then((ok) => {
			// On success the new token sets the next timer. On failure, retry in a minute;
			// once the token actually expires, the normal 401 handling takes over.
			if (stopped) return;
			if (ok) check();
			else timer = window.setTimeout(check, RENEW_BEFORE_MS);
		});
	};

	const onVisible = () => {
		if (document.visibilityState === "visible") check();
	};

	check();
	document.addEventListener("visibilitychange", onVisible);
	window.addEventListener("focus", check);
	return () => {
		stopped = true;
		window.clearTimeout(timer);
		document.removeEventListener("visibilitychange", onVisible);
		window.removeEventListener("focus", check);
	};
}

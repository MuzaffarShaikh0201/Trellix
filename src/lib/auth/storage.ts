import type { AuthSession } from "@/types/auth";

const ACCESS = "trellix.accessToken";
const REFRESH = "trellix.refreshToken";
const SESSION = "trellix.sessionId";

export function getStoredAccessToken(): string | null {
	return localStorage.getItem(ACCESS);
}

export function getStoredRefreshToken(): string | null {
	return localStorage.getItem(REFRESH);
}

export function setAuthSession(session: AuthSession): void {
	localStorage.setItem(ACCESS, session.access_token);
	localStorage.setItem(REFRESH, session.refresh_token);
	localStorage.setItem(SESSION, session.session_id);
}

export function clearAuthSession(): void {
	localStorage.removeItem(ACCESS);
	localStorage.removeItem(REFRESH);
	localStorage.removeItem(SESSION);
}

export function readAuthSession(): AuthSession | null {
	const access_token = localStorage.getItem(ACCESS);
	const refresh_token = localStorage.getItem(REFRESH);
	const session_id = localStorage.getItem(SESSION);
	if (!access_token || !refresh_token || !session_id) return null;
	return { access_token, refresh_token, session_id };
}

import type { APIRequestContext, Page } from "@playwright/test";

export const API = process.env.E2E_API_URL ?? "http://127.0.0.1:5000";
export const PASSWORD = "E2ePass123!";

export type Session = { access_token: string; refresh_token: string; session_id: string; email: string };

/** A unique throwaway email for this run. */
export function uniqueEmail(tag: string): string {
	return `e2e-${tag}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
}

/** A run signs up 3 accounts; the API allows 5 sign-ups per IP per hour unless rate limits are off. */
async function failure(what: string, res: { status(): number; text(): Promise<string> }): Promise<Error> {
	const hint =
		res.status() === 429 ? " (rate limited: start the backend with RATE_LIMIT_ENABLED=false for e2e runs)" : "";
	return new Error(`${what} failed: ${res.status()} ${await res.text()}${hint}`);
}

/** Registers and logs in a fresh account through the API. */
export async function createAccount(request: APIRequestContext, tag: string): Promise<Session> {
	const email = uniqueEmail(tag);
	const reg = await request.post(`${API}/register`, {
		form: { first_name: "E2E", last_name: "Tester", email, password: PASSWORD },
	});
	if (!reg.ok()) throw await failure("register", reg);
	const login = await request.post(`${API}/login`, { form: { email, password: PASSWORD } });
	if (!login.ok()) throw await failure("login", login);
	return { ...(await login.json()), email };
}

/** Puts the session in localStorage before the app boots. */
export async function signIn(page: Page, session: Session) {
	await page.addInitScript((s) => {
		localStorage.setItem("trellix.accessToken", s.access_token);
		localStorage.setItem("trellix.refreshToken", s.refresh_token);
		localStorage.setItem("trellix.sessionId", s.session_id);
	}, session);
}

/** Authenticated JSON call to the backend, for setting up data and checking results. */
export async function api<T>(request: APIRequestContext, session: Session, method: string, path: string, data?: unknown): Promise<T> {
	const res = await request.fetch(`${API}${path}`, {
		method,
		headers: { Authorization: `Bearer ${session.access_token}` },
		data,
	});
	if (!res.ok()) throw await failure(`${method} ${path}`, res);
	return (await res.json()) as T;
}

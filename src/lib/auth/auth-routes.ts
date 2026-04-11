/** Routes that only guests should see; signed-in users are redirected away. */
export const AUTH_ROUTE_PATHS: ReadonlySet<string> = new Set([
	"/login",
	"/signup",
	"/forgot-password",
]);

export function pathnameOnly(path: string): string {
	const noHash = path.split("#")[0] ?? path;
	return (noHash.split("?")[0] ?? noHash) || "/";
}

export function isAuthRoutePath(path: string): boolean {
	return AUTH_ROUTE_PATHS.has(pathnameOnly(path));
}

/**
 * Safe in-app navigation target from `redirectTo` query params.
 * Blocks open redirects (`//evil.com`, `https:…`) and auth URLs to avoid loops.
 */
export function safeAppRedirectTarget(
	raw: string | null | undefined,
	fallback = "/",
): string {
	if (raw == null || raw === "") {
		return fallback;
	}
	let decoded: string;
	try {
		decoded = decodeURIComponent(raw.trim());
	} catch {
		return fallback;
	}
	if (!decoded.startsWith("/") || decoded.startsWith("//")) {
		return fallback;
	}
	if (decoded.includes("://") || decoded.includes("\\")) {
		return fallback;
	}
	if (isAuthRoutePath(decoded)) {
		return fallback;
	}
	return decoded;
}

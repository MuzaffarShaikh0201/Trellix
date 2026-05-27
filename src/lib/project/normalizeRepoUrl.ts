/** Returns a safe absolute URL for opening a repository link, or null if invalid. */
export function normalizeRepoUrl(url: string): string | null {
	const trimmed = url.trim();
	if (!trimmed) return null;
	try {
		return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
			.href;
	} catch {
		return null;
	}
}

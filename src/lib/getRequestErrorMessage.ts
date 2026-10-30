import { ApiError, isHttpValidationError } from "@/types/api";

function stringField(body: unknown, key: "detail" | "message"): string | null {
	if (typeof body !== "object" || body === null || !(key in body)) return null;
	const value = (body as Record<string, unknown>)[key];
	return typeof value === "string" && value.trim() ? value : null;
}

/** A message for the user from any request error: the API's own text when it has one. */
export function getRequestErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
): string {
	if (error instanceof ApiError) {
		if (isHttpValidationError(error.body)) {
			const parts = error.body.detail.map((d) => d.msg).filter(Boolean);
			if (parts.length > 0) return parts.join(" ");
		}
		const text = stringField(error.body, "detail") ?? stringField(error.body, "message");
		if (text) return text;
		if (error.status === 429) return "Too many requests. Please wait a moment and try again.";
		return fallback;
	}
	// fetch() rejects with a TypeError when the server can't be reached.
	if (error instanceof TypeError) return "Can’t reach the server. Check your connection and try again.";
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

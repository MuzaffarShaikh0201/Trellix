import { ApiError, isHttpValidationError } from "@/types/api";

export function getRequestErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
): string {
	if (error instanceof ApiError) {
		if (isHttpValidationError(error.body)) {
			const parts = error.body.detail.map((d) => d.msg).filter(Boolean);
			if (parts.length > 0) return parts.join(" ");
		}
		if (
			typeof error.body === "object" &&
			error.body !== null &&
			"message" in error.body &&
			typeof (error.body as { message: unknown }).message === "string"
		) {
			return (error.body as { message: string }).message;
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return fallback;
}

export type ValidationErrorDetail = {
	loc: (string | number)[];
	msg: string;
	type: string;
};

export type HttpValidationErrorBody = {
	detail: ValidationErrorDetail[];
};

export class ApiError extends Error {
	readonly status: number;
	readonly body: unknown;
	/** Seconds to wait before retrying a 429, when known. */
	readonly retryAfter: number | null;

	constructor(status: number, body: unknown, message?: string, retryAfter: number | null = null) {
		super(message ?? `Request failed with status ${status}`);
		this.name = "ApiError";
		this.status = status;
		this.body = body;
		this.retryAfter = retryAfter;
	}
}

export function isHttpValidationError(
	body: unknown,
): body is HttpValidationErrorBody {
	return (
		typeof body === "object" &&
		body !== null &&
		"detail" in body &&
		Array.isArray((body as HttpValidationErrorBody).detail)
	);
}

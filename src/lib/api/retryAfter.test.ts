import { describe, expect, it } from "vitest";

import { parseRetryAfter } from "@/lib/api/retryAfter";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { formatWait } from "@/hooks/useCooldown";
import { ApiError } from "@/types/api";

describe("parseRetryAfter", () => {
	const now = Date.parse("2026-10-30T12:00:00Z");

	it("reads seconds from the header", () => {
		expect(parseRetryAfter("812", null)).toBe(812);
	});

	it("reads an HTTP date from the header", () => {
		expect(parseRetryAfter("Fri, 30 Oct 2026 12:01:30 GMT", null, now)).toBe(90);
	});

	it("falls back to the wait in the API message", () => {
		expect(parseRetryAfter(null, { detail: "Too many requests. Try again in 14 minutes." })).toBe(840);
		expect(parseRetryAfter(null, { detail: "Too many requests. Try again in 30 seconds." })).toBe(30);
		expect(parseRetryAfter(null, { detail: "Try again in 1 hour." })).toBe(3600);
		expect(parseRetryAfter(null, { detail: "Try again in a minute." })).toBe(60);
	});

	it("returns null when the wait is unknown", () => {
		expect(parseRetryAfter(null, { detail: "Too many requests." })).toBeNull();
		expect(parseRetryAfter(null, null)).toBeNull();
	});
});

describe("getRequestErrorMessage", () => {
	it("shows a string detail as-is", () => {
		const err = new ApiError(429, { detail: "Too many requests. Try again in 14 minutes." });
		expect(getRequestErrorMessage(err)).toBe("Too many requests. Try again in 14 minutes.");
	});

	it("joins validation messages, e.g. every failed password rule", () => {
		const err = new ApiError(422, {
			detail: [
				{ loc: ["body", "password"], msg: "Password must contain at least one uppercase letter.", type: "missing_uppercase" },
				{ loc: ["body", "password"], msg: "Password must contain at least one number.", type: "missing_number" },
			],
		});
		expect(getRequestErrorMessage(err)).toBe(
			"Password must contain at least one uppercase letter. Password must contain at least one number.",
		);
	});

	it("uses the fallback instead of 'Request failed with status …'", () => {
		expect(getRequestErrorMessage(new ApiError(500, null), "Could not save.")).toBe("Could not save.");
	});

	it("explains a network failure", () => {
		expect(getRequestErrorMessage(new TypeError("Failed to fetch"))).toMatch(/reach the server/);
	});
});

describe("formatWait", () => {
	it("formats short and long waits", () => {
		expect(formatWait(45)).toBe("45s");
		expect(formatWait(125)).toBe("2:05");
		expect(formatWait(840)).toBe("14 min");
	});
});

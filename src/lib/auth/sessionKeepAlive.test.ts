import { describe, expect, it } from "vitest";

import { renewDelay, tokenExpiresAt } from "@/lib/auth/sessionKeepAlive";

/** Builds an unsigned JWT-shaped string with the given payload. */
function fakeJwt(payload: object): string {
	const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	return `${b64({ alg: "HS256" })}.${b64(payload)}.sig`;
}

describe("session keep-alive timing", () => {
	const now = 1_800_000_000_000;

	it("reads the token expiry", () => {
		expect(tokenExpiresAt(fakeJwt({ exp: 1_800_000_900 }))).toBe(1_800_000_900_000);
		expect(tokenExpiresAt("not-a-jwt")).toBeNull();
		expect(tokenExpiresAt(null)).toBeNull();
	});

	it("renews one minute before expiry", () => {
		// Expires in 15 minutes → renew in 14.
		expect(renewDelay(fakeJwt({ exp: (now + 15 * 60_000) / 1000 }), now)).toBe(14 * 60_000);
	});

	it("renews immediately when inside the last minute or already expired", () => {
		expect(renewDelay(fakeJwt({ exp: (now + 30_000) / 1000 }), now)).toBe(0);
		expect(renewDelay(fakeJwt({ exp: (now - 60_000) / 1000 }), now)).toBe(0);
	});

	it("doesn't schedule without a readable token", () => {
		expect(renewDelay(null, now)).toBeNull();
	});
});

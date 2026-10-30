import { apiRequest } from "@/lib/api/client";
import { postSessionRefresh } from "@/lib/api/session-refresh";
import type {
	AuthSession,
	LoginParams,
	MessageResponse,
	RegisterParams,
	RegisterResponse,
	ResendVerificationResponse,
} from "@/types/auth";

export function registerUser(params: RegisterParams) {
	return apiRequest<RegisterResponse>("/register", {
		method: "POST",
		auth: false,
		form: params,
	});
}

export function loginUser(params: LoginParams) {
	return apiRequest<AuthSession>("/login", {
		method: "POST",
		auth: false,
		form: params,
	});
}

export function refreshTokens(refreshToken: string) {
	return postSessionRefresh(refreshToken);
}

export function logoutUser() {
	return apiRequest<MessageResponse>("/logout", {
		method: "POST",
	});
}

/** Confirms an email from the link in the verification email. No auth needed. */
export function verifyEmail(token: string) {
	return apiRequest<MessageResponse>("/email/verify", { method: "POST", auth: false, form: { token } });
}

/** Sends a fresh verification link. Always succeeds with the same message. */
export function resendVerificationEmail(email: string) {
	return apiRequest<ResendVerificationResponse>("/email/verify/resend", {
		method: "POST",
		auth: false,
		form: { email },
	});
}

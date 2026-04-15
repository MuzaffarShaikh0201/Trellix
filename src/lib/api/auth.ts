import { apiRequest } from "@/lib/api/client";
import { postSessionRefresh } from "@/lib/api/session-refresh";
import type {
	AuthSession,
	LoginParams,
	MessageResponse,
	RegisterParams,
} from "@/types/auth";

export function registerUser(params: RegisterParams) {
	return apiRequest<MessageResponse>("/register", {
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

export function requestPasswordReset(email: string) {
	return apiRequest<MessageResponse>("/forgot-password", {
		method: "POST",
		auth: false,
		searchParams: { email },
	});
}

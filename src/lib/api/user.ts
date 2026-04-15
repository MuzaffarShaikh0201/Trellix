import { apiRequest } from "@/lib/api/client";
import type { MessageResponse, User } from "@/types/auth";

export function fetchCurrentUser(options?: { signal?: AbortSignal }) {
	return apiRequest<User>("/user", { signal: options?.signal });
}

export function updateUserProfile(params: {
	first_name?: string;
	last_name?: string;
}) {
	return apiRequest<MessageResponse>("/user", {
		method: "PUT",
		json: params,
	});
}

export function updateUserPassword(params: {
	current_password: string;
	new_password: string;
}) {
	return apiRequest<MessageResponse>("/user", {
		method: "PATCH",
		form: params,
	});
}

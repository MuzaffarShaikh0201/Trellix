import { apiRequest } from "@/lib/api/client";
import type { MessageResponse } from "@/types/auth";
import type { GetActivityResponse, GetNotificationsResponse } from "@/types/activity";

export function fetchProjectActivity(projectId: string, params: { page?: number; limit?: number } = {}) {
	return apiRequest<GetActivityResponse>(`/project/${projectId}/activity`, { searchParams: params });
}

export function fetchNotifications(params: { is_read?: boolean; page?: number; limit?: number } = {}) {
	return apiRequest<GetNotificationsResponse>("/notification", { searchParams: params });
}

export function markNotificationRead(id: string) {
	return apiRequest<MessageResponse>(`/notification/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
	return apiRequest<MessageResponse & { updated: number }>("/notification/read-all", { method: "PATCH" });
}

/** Always succeeds with the same message so accounts can't be discovered. */
export function requestPasswordReset(email: string) {
	return apiRequest<MessageResponse>("/password/forgot", {
		method: "POST",
		auth: false,
		form: { email },
	});
}

export function resetPassword(token: string, newPassword: string) {
	return apiRequest<MessageResponse>("/password/reset", {
		method: "POST",
		auth: false,
		form: { token, new_password: newPassword },
	});
}

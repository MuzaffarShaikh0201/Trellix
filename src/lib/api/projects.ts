import { apiRequest } from "@/lib/api/client";
import type {
	CreateProjectParams,
	GetProjectsParams,
	GetProjectsResponse,
} from "@/types/project";
import type { MessageResponse } from "@/types/auth";

export function fetchProjects(params: GetProjectsParams = {}) {
	return apiRequest<GetProjectsResponse>("/project", {
		searchParams: params,
	});
}

export function toggleProjectFavorite(projectId: string) {
	return apiRequest<MessageResponse>(`/project/${projectId}/toggle-favorite`, {
		method: "PATCH",
	});
}

export function createProject(payload: CreateProjectParams) {
	return apiRequest<MessageResponse>("/project", {
		method: "POST",
		json: payload,
	});
}

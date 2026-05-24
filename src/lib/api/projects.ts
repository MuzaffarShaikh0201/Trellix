import { apiRequest } from "@/lib/api/client";
import type {
	CreateProjectParams,
	CreateProjectResponse,
	GetProjectsParams,
	GetProjectsResponse,
	Project,
	UpdateProjectParams,
} from "@/types/project";
import type { MessageResponse } from "@/types/auth";

export function fetchProjects(params: GetProjectsParams = {}) {
	return apiRequest<GetProjectsResponse>("/project", {
		searchParams: params,
	});
}

export function fetchProject(projectId: string) {
	return apiRequest<Project>(`/project/${projectId}`);
}

export function createProject(payload: CreateProjectParams) {
	return apiRequest<CreateProjectResponse>("/project", {
		method: "POST",
		json: payload,
	});
}

export function updateProject(projectId: string, payload: UpdateProjectParams) {
	return apiRequest<MessageResponse>(`/project/${projectId}`, {
		method: "PUT",
		json: payload,
	});
}

export function deleteProject(projectId: string) {
	return apiRequest<MessageResponse>(`/project/${projectId}`, {
		method: "DELETE",
	});
}

export function toggleProjectFavorite(projectId: string) {
	return apiRequest<MessageResponse>(`/project/${projectId}/toggle-favorite`, {
		method: "PATCH",
	});
}

export function toggleProjectArchived(projectId: string) {
	return apiRequest<MessageResponse>(`/project/${projectId}/toggle-archived`, {
		method: "PATCH",
	});
}

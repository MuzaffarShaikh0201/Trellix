import { apiRequest } from "@/lib/api/client";
import type { MessageResponse } from "@/types/auth";
import type {
	CalendarTask,
	CreateTaskParams,
	GetTasksDueParams,
	GetTasksResponse,
	MoveTaskParams,
	Task,
	TaskPriority,
	TaskStatus,
	UpdateTaskParams,
} from "@/types/task";

export function fetchTasks(
	projectId: string,
	params: { status?: TaskStatus; priority?: TaskPriority } = {},
) {
	return apiRequest<GetTasksResponse>(`/project/${projectId}/task`, { searchParams: params });
}

/** Every task due in a date range, across projects (at most 62 days). */
export function fetchTasksDue(params: GetTasksDueParams) {
	return apiRequest<{ tasks: CalendarTask[] }>("/task", { searchParams: params });
}

export function fetchTask(taskId: string) {
	return apiRequest<Task>(`/task/${taskId}`);
}

export function createTask(projectId: string, payload: CreateTaskParams) {
	return apiRequest<{ task_id: string }>(`/project/${projectId}/task`, {
		method: "POST",
		json: payload,
	});
}

export function updateTask(taskId: string, payload: UpdateTaskParams) {
	return apiRequest<MessageResponse>(`/task/${taskId}`, { method: "PUT", json: payload });
}

/** Drag and drop: put the task in `status` at index `position`. */
export function moveTask(taskId: string, payload: MoveTaskParams) {
	return apiRequest<MessageResponse>(`/task/${taskId}/move`, { method: "PATCH", json: payload });
}

export function deleteTask(taskId: string) {
	return apiRequest<MessageResponse>(`/task/${taskId}`, { method: "DELETE" });
}

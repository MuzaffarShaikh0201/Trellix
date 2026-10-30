import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { createTask, deleteTask, fetchTasks, fetchTasksDue, moveTask, updateTask } from "@/lib/api/tasks";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { projectKeys } from "@/lib/queries";
import { showAlert } from "@/services/alertService";
import type {
	CreateTaskParams,
	GetTasksResponse,
	Task,
	TaskStatus,
	UpdateTaskParams,
} from "@/types/task";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const taskKeys = {
	list: (projectId: string) => ["tasks", projectId] as const,
	due: ["tasks-due"] as const,
	dueRange: (from: string, to: string) => ["tasks-due", from, to] as const,
};

export function useTasks(projectId: string) {
	return useQuery({ queryKey: taskKeys.list(projectId), queryFn: () => fetchTasks(projectId) });
}

/** Tasks due between two YYYY-MM-DD dates (inclusive, at most 62 days), across projects. */
export function useTasksDue(from: string, to: string) {
	return useQuery({
		queryKey: taskKeys.dueRange(from, to),
		queryFn: () => fetchTasksDue({ due_from: from, due_to: to }),
		placeholderData: keepPreviousData,
	});
}

/** Tasks grouped by column, each sorted by position. */
export function groupTasks(tasks: Task[]): Record<TaskStatus, Task[]> {
	const groups: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
	for (const t of tasks) groups[t.status].push(t);
	for (const s of TASK_STATUSES) groups[s].sort((a, b) => a.position - b.position);
	return groups;
}

/** Same reordering the server does: remove from the old column, insert, renumber both columns. */
export function applyMove(tasks: Task[], id: string, status: TaskStatus, position: number): Task[] {
	const moving = tasks.find((t) => t.id === id);
	if (!moving) return tasks;
	const groups = groupTasks(tasks.filter((t) => t.id !== id));
	const target = groups[status];
	const index = Math.max(0, Math.min(position, target.length));
	const now = new Date().toISOString();
	const completed_at =
		status === "DONE" ? (moving.status === "DONE" ? moving.completed_at : now) : null;
	target.splice(index, 0, { ...moving, status, completed_at });
	return TASK_STATUSES.flatMap((s) => groups[s].map((t, i) => ({ ...t, position: i })));
}

/** Tasks change project task_counts and the activity feed, so refresh those too. */
function refreshAfterTaskChange(qc: QueryClient, projectId: string) {
	return Promise.all([
		qc.invalidateQueries({ queryKey: taskKeys.list(projectId) }),
		qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
		qc.invalidateQueries({ queryKey: projectKeys.all }),
		qc.invalidateQueries({ queryKey: ["activity", projectId] }),
		qc.invalidateQueries({ queryKey: taskKeys.due }),
	]);
}

function onFail(title: string) {
	return (err: unknown) => showAlert(title, "error", getRequestErrorMessage(err, "Please try again."));
}

export function useCreateTask(projectId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateTaskParams) => createTask(projectId, payload),
		onError: onFail("Could not add task"),
		onSettled: () => refreshAfterTaskChange(qc, projectId),
	});
}

export function useUpdateTask(projectId: string) {
	const qc = useQueryClient();
	const key = taskKeys.list(projectId);
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskParams }) => updateTask(id, payload),
		onMutate: async ({ id, payload }) => {
			await qc.cancelQueries({ queryKey: key });
			const previous = qc.getQueryData<GetTasksResponse>(key);
			qc.setQueryData<GetTasksResponse>(key, (d) =>
				d ? { tasks: d.tasks.map((t) => (t.id === id ? ({ ...t, ...payload } as Task) : t)) } : d,
			);
			return { previous };
		},
		onError: (err, _v, ctx) => {
			if (ctx?.previous) qc.setQueryData(key, ctx.previous);
			onFail("Could not save task")(err);
		},
		onSettled: () => refreshAfterTaskChange(qc, projectId),
	});
}

export function useMoveTask(projectId: string) {
	const qc = useQueryClient();
	const key = taskKeys.list(projectId);
	return useMutation({
		mutationFn: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
			moveTask(id, { status, position }),
		onMutate: async ({ id, status, position }) => {
			await qc.cancelQueries({ queryKey: key });
			const previous = qc.getQueryData<GetTasksResponse>(key);
			qc.setQueryData<GetTasksResponse>(key, (d) => (d ? { tasks: applyMove(d.tasks, id, status, position) } : d));
			return { previous };
		},
		onError: (err, _v, ctx) => {
			if (ctx?.previous) qc.setQueryData(key, ctx.previous);
			onFail("Could not move task")(err);
		},
		onSettled: () => refreshAfterTaskChange(qc, projectId),
	});
}

export function useDeleteTask(projectId: string) {
	const qc = useQueryClient();
	const key = taskKeys.list(projectId);
	return useMutation({
		mutationFn: (id: string) => deleteTask(id),
		onMutate: async (id) => {
			await qc.cancelQueries({ queryKey: key });
			const previous = qc.getQueryData<GetTasksResponse>(key);
			qc.setQueryData<GetTasksResponse>(key, (d) => (d ? { tasks: d.tasks.filter((t) => t.id !== id) } : d));
			return { previous };
		},
		onError: (err, _v, ctx) => {
			if (ctx?.previous) qc.setQueryData(key, ctx.previous);
			onFail("Could not delete task")(err);
		},
		onSettled: () => refreshAfterTaskChange(qc, projectId),
	});
}

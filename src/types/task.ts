export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
	id: string;
	project_id: string;
	user_id: string;
	title: string;
	description: string | null;
	status: TaskStatus;
	priority: TaskPriority;
	due_date: string | null;
	/** 0-based order within its status column. */
	position: number;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type GetTasksResponse = { tasks: Task[] };

/** A task from `GET /task` (across projects), with its project attached. */
export type CalendarTask = Task & {
	project: { id: string; title: string; color: string | null };
};

export type GetTasksDueParams = {
	/** YYYY-MM-DD, inclusive. The range can be at most 62 days. */
	due_from: string;
	due_to: string;
	status?: TaskStatus;
	include_archived?: boolean;
};

export type CreateTaskParams = {
	title: string;
	description?: string | null;
	status?: TaskStatus;
	priority?: TaskPriority;
	due_date?: string | null;
};

export type UpdateTaskParams = {
	title?: string;
	description?: string | null;
	priority?: TaskPriority;
	due_date?: string | null;
};

export type MoveTaskParams = { status: TaskStatus; position: number };

/** Not-done tasks by priority, plus totals. Present on project responses. */
export type TaskCounts = {
	total: number;
	completed: number;
	low: number;
	medium: number;
	high: number;
};

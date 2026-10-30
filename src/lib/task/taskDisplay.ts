import type { TaskPriority, TaskStatus } from "@/types/task";

export const TASK_STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
	TODO: { label: "To do", dot: "bg-slate-400" },
	IN_PROGRESS: { label: "In progress", dot: "bg-primary" },
	DONE: { label: "Done", dot: "bg-emerald-500" },
};

export const TASK_PRIORITIES: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];

export const TASK_PRIORITY_META: Record<TaskPriority, { label: string; pill: string; dot: string }> = {
	HIGH: { label: "High", pill: "bg-red-500/10 text-red-700 dark:text-red-300", dot: "bg-red-500" },
	MEDIUM: { label: "Medium", pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
	LOW: { label: "Low", pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
};

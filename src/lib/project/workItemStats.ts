import type { Project } from "@/types/project";

export type WorkItemStats = {
	low: number;
	medium: number;
	high: number;
	completed: number;
	total: number;
};

function asNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

function readCount(source: Record<string, unknown>, keys: string[]): number {
	for (const key of keys) {
		const value = asNumber(source[key]);
		if (value != null) return Math.max(0, Math.round(value));
	}
	return 0;
}

export function parseWorkItemStats(project: Project): WorkItemStats {
	const raw = project as unknown as Record<string, unknown>;
	const nestedWorkItems =
		typeof raw.work_items === "object" && raw.work_items !== null
			? (raw.work_items as Record<string, unknown>)
			: null;
	const nestedTaskCounts =
		typeof raw.task_counts === "object" && raw.task_counts !== null
			? (raw.task_counts as Record<string, unknown>)
			: null;

	const source = { ...raw, ...nestedTaskCounts, ...nestedWorkItems };

	const low = readCount(source, ["low", "low_priority", "low_tasks"]);
	const medium = readCount(source, ["medium", "medium_priority", "medium_tasks"]);
	const high = readCount(source, ["high", "high_priority", "high_tasks"]);
	const byPriorityTotal = low + medium + high;
	const total = readCount(source, ["total", "total_tasks"]) || byPriorityTotal;

	let completed = readCount(source, ["completed", "completed_tasks", "done_tasks"]);
	if (completed === 0 && project.status === "COMPLETED" && total > 0) {
		completed = total;
	}
	if (completed > total && total > 0) completed = total;

	return { low, medium, high, completed, total };
}

export function taskCompletionPercent(stats: WorkItemStats): number {
	return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
}

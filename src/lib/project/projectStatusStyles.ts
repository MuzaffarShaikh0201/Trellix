import type { ProjectStatus } from "@/types/project";

type StatusMeta = {
	label: string;
	/** Filled pill background + text. */
	pill: string;
	/** Small dot / bar color. */
	dot: string;
};

export const PROJECT_STATUSES: ProjectStatus[] = [
	"PLANNING",
	"IN_PROGRESS",
	"ON_HOLD",
	"COMPLETED",
	"ABANDONED",
];

export const PROJECT_STATUS_META: Record<ProjectStatus, StatusMeta> = {
	PLANNING: {
		label: "Planning",
		pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
		dot: "bg-violet-500",
	},
	IN_PROGRESS: {
		label: "In progress",
		pill: "bg-primary/10 text-blue-700 dark:text-blue-300",
		dot: "bg-primary",
	},
	ON_HOLD: {
		label: "On hold",
		pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
		dot: "bg-amber-500",
	},
	COMPLETED: {
		label: "Completed",
		pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
		dot: "bg-emerald-500",
	},
	ABANDONED: {
		label: "Abandoned",
		pill: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
		dot: "bg-slate-400",
	},
};

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES.map((value) => ({
	value,
	label: PROJECT_STATUS_META[value].label,
}));

export function formatProjectStatusLabel(status: ProjectStatus): string {
	return PROJECT_STATUS_META[status].label;
}

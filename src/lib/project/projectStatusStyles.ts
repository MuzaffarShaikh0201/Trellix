import type { ProjectStatus } from "@/types/project";

export const projectStatusChipBaseClass =
	"inline-flex shrink-0 whitespace-nowrap rounded border px-2 py-0.5 text-[11px] font-medium";

export const projectStatusClassMap: Record<ProjectStatus, string> = {
	PLANNING: "border-violet-500/50 text-violet-500",
	IN_PROGRESS: "border-primary/50 text-primary",
	ON_HOLD: "border-violet-400/50 text-violet-400",
	COMPLETED: "border-emerald-500/50 text-emerald-500",
	ABANDONED: "border-red-500/50 text-red-500",
};

export function formatProjectStatusLabel(status: ProjectStatus): string {
	return status
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

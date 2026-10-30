import {
	DUE_TONE_CLASS,
	dueInfo,
	formatDay,
	projectColor,
	timelinePercent,
} from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

type TimelineProject = Pick<Project, "id" | "color" | "status" | "start_date" | "end_date">;

export function TimelineBar({
	project,
	className,
}: {
	project: TimelineProject;
	className?: string;
}) {
	const pct = timelinePercent(project);
	return (
		<div className={cn("h-1.5 overflow-hidden rounded-full bg-surface-2", className)}>
			<div
				className="h-full rounded-full transition-[width]"
				style={{ width: `${pct}%`, background: projectColor(project) }}
			/>
		</div>
	);
}

export function DueLabel({ project, className }: { project: TimelineProject; className?: string }) {
	const due = dueInfo(project);
	return <span className={cn("font-medium", DUE_TONE_CLASS[due.tone], className)}>{due.label}</span>;
}

/** Dates on the left, days-left on the right, bar underneath. */
export function ProjectTimeline({ project }: { project: TimelineProject }) {
	const hasDates = project.start_date || project.end_date;
	return (
		<div>
			<div className="flex justify-between gap-2 text-[11px]">
				<span className="truncate text-muted">
					{hasDates
						? `${formatDay(project.start_date)} → ${formatDay(project.end_date)}`
						: "No dates set"}
				</span>
				<DueLabel project={project} />
			</div>
			<TimelineBar project={project} className="mt-1.5" />
		</div>
	);
}

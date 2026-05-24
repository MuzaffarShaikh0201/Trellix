import {
	parseWorkItemStats,
	taskCompletionPercent,
	type WorkItemStats,
} from "@/lib/project/workItemStats";
import type { Project } from "@/types/project";

type ProjectHeaderStatsProps = {
	project: Project;
};

function priorityPercents(stats: WorkItemStats) {
	if (stats.total <= 0) {
		return { low: 0, medium: 0, high: 0 };
	}
	return {
		low: (stats.low / stats.total) * 100,
		medium: (stats.medium / stats.total) * 100,
		high: (stats.high / stats.total) * 100,
	};
}

const statColumnClass = "flex w-[8.75rem] min-w-[8.75rem] flex-col sm:w-36 sm:min-w-36";

export function ProjectHeaderStats({ project }: ProjectHeaderStatsProps) {
	const workItems = parseWorkItemStats(project);
	const progress = taskCompletionPercent(workItems);
	const { low, medium, high } = priorityPercents(workItems);

	return (
		<div className="hidden shrink-0 gap-3 md:flex sm:gap-4">
			<div className={statColumnClass}>
				<p className="text-[11px] text-text-secondary">Work Items (%)</p>
				<div className="mt-1 flex items-center gap-1 text-sm font-medium text-text-primary">
					<span>{workItems.low}</span>
					<span className="text-text-secondary">·</span>
					<span>{workItems.medium}</span>
					<span className="text-text-secondary">·</span>
					<span>{workItems.high}</span>
				</div>
				<div className="mt-1.5 flex h-1 w-full overflow-hidden rounded-full bg-tint">
					<div className="bg-sky-500" style={{ width: `${low}%` }} aria-hidden />
					<div
						className="bg-cyan-400"
						style={{ width: `${medium}%` }}
						aria-hidden
					/>
					<div className="bg-red-500" style={{ width: `${high}%` }} aria-hidden />
				</div>
			</div>
			<div className={statColumnClass}>
				<p className="text-[11px] text-text-secondary">Tasks Completed</p>
				<div className="mt-1 flex w-full items-center justify-between text-sm font-medium text-text-primary">
					<span>{progress}%</span>
					<span className="text-xs text-text-secondary">
						{workItems.completed}/{workItems.total}
					</span>
				</div>
				<div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-tint">
					<div
						className="h-full rounded-full bg-emerald-500"
						style={{ width: `${progress}%` }}
						aria-hidden
					/>
				</div>
			</div>
		</div>
	);
}

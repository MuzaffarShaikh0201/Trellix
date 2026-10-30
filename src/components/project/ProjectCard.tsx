import { Link } from "react-router";
import { LuArrowRightLeft, LuCircleCheck, LuStar } from "react-icons/lu";

import { ProjectRepoBadge } from "@/components/project/ProjectRepoBadge";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { DueLabel, ProjectTimeline, TimelineBar } from "@/components/project/ProjectTimeline";
import { ProjectTile } from "@/components/project/ProjectTile";
import { cardClass } from "@/components/ui/Card";
import { formatDay, timeAgo } from "@/lib/project/projectDisplay";
import { PROJECT_STATUS_OPTIONS } from "@/lib/project/projectStatusStyles";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/project";

type FavoriteProps = {
	onToggleFavorite: (projectId: string) => void;
	favoritePending: boolean;
};

export function FavoriteStar({
	project,
	onToggleFavorite,
	favoritePending,
	className,
}: FavoriteProps & { project: Project; className?: string }) {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onToggleFavorite(project.id);
			}}
			disabled={favoritePending}
			aria-pressed={project.is_favorite}
			aria-label={project.is_favorite ? "Remove from favorites" : "Add to favorites"}
			className={cn(
				"grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-amber-500",
				className,
			)}
		>
			<LuStar className={cn("size-4", project.is_favorite && "fill-amber-400 text-amber-400")} />
		</button>
	);
}

export function ProjectCard({ project, ...fav }: FavoriteProps & { project: Project }) {
	return (
		<Link
			to={`/projects/${project.id}`}
			className={cn(
				cardClass,
				"group flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
			)}
		>
			<div className="flex items-start gap-3">
				<ProjectTile project={project} />
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-[15px] font-semibold" title={project.title}>
						{project.title}
					</h3>
					<p className="text-[11px] text-muted">Updated {timeAgo(project.updated_at)}</p>
				</div>
				<FavoriteStar project={project} {...fav} className="-mt-1 -mr-1" />
			</div>
			<p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted">
				{project.description?.trim() || <span className="italic opacity-70">No description</span>}
			</p>
			<div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5">
				<ProjectStatusChip status={project.status} />
				{project.is_archived ? (
					<span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[11px] font-medium text-muted">Archived</span>
				) : null}
				<ProjectRepoBadge repoUrl={project.repo_url} className="max-w-[50%]" />
				<TaskProgressChip project={project} />
			</div>
			<div className="mt-4 border-t border-line pt-3">
				<ProjectTimeline project={project} />
			</div>
		</Link>
	);
}

/** "✓ 5/12" chip from project.task_counts; hidden when the project has no tasks. */
export function TaskProgressChip({ project }: { project: Project }) {
	const c = project.task_counts;
	if (!c?.total) return null;
	const allDone = c.completed === c.total;
	return (
		<span
			title={`${c.completed} of ${c.total} tasks done`}
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
				allDone ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-surface-2 text-muted",
			)}
		>
			<LuCircleCheck className="size-3" />
			{c.completed}/{c.total}
		</span>
	);
}

/** Compact card used in board columns. */
export function ProjectBoardCard({
	project,
	draggable,
	onMove,
}: {
	project: Project;
	draggable: boolean;
	/** Changes status without drag and drop (touch screens, keyboard). */
	onMove: (status: ProjectStatus) => void;
}) {
	return (
		<div
			draggable={draggable}
			onDragStart={(e) => {
				e.dataTransfer.setData("text/project-id", project.id);
				e.dataTransfer.effectAllowed = "move";
			}}
			className={cn(
				cardClass,
				"group relative p-3 transition hover:border-primary/40",
				draggable && "cursor-grab active:cursor-grabbing",
			)}
		>
			<div className="flex items-center gap-2">
				<ProjectTile project={project} className="size-6 rounded-md text-[9px]" />
				<Link
					to={`/projects/${project.id}`}
					draggable={false}
					className="truncate text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-primary/40"
				>
					{project.title}
				</Link>
				{project.is_favorite ? (
					<LuStar className="ml-auto size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Favorite" />
				) : null}
			</div>
			<TimelineBar project={project} className="mt-2.5 h-1" />
			<div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
				<span className="text-muted">{formatDay(project.end_date)}</span>
				<div className="flex items-center gap-1.5">
					<DueLabel project={project} />
					<label
						title="Move to…"
						className={cn(
							"relative z-10 grid size-6 cursor-pointer place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg",
							draggable && "md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100",
						)}
					>
						<LuArrowRightLeft className="size-3.5" />
						<select
							value={project.status}
							onChange={(e) => onMove(e.target.value as ProjectStatus)}
							aria-label={`Move ${project.title} to another status`}
							className="absolute inset-0 cursor-pointer opacity-0"
						>
							{PROJECT_STATUS_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>
		</div>
	);
}

import { MdFavorite, MdFavoriteBorder, MdOpenInNew } from "react-icons/md";

import { CircularProgressRing } from "@/components/project/CircularProgressRing";
import { projectCardShellClass } from "@/components/project/project-card-shell";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/project";

const statusClassMap: Record<ProjectStatus, string> = {
	PLANNING: "border-violet-500/50 text-violet-500",
	IN_PROGRESS: "border-primary/50 text-primary",
	ON_HOLD: "border-violet-400/50 text-violet-400",
	COMPLETED: "border-emerald-500/50 text-emerald-500",
	ABANDONED: "border-red-500/50 text-red-500",
};

function formatDate(value: string | null): string {
	if (!value) return "—";
	try {
		const d = new Date(value);
		const day = String(d.getDate()).padStart(2, "0");
		const month = d.toLocaleString(undefined, { month: "short" });
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	} catch {
		return value;
	}
}

function prettifyToken(value: string) {
	return value
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

const PROJECT_TITLE_MAX_CHARS = 48;

function normalizeInlineText(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxChars: number) {
	const normalized = normalizeInlineText(value);
	if (normalized.length <= maxChars) return normalized;
	return `${normalized.slice(0, maxChars).trimEnd()}...`;
}

function truncateProjectTitle(value: string) {
	return truncateText(value, PROJECT_TITLE_MAX_CHARS);
}

function getRepoDisplayName(url: string | null): string | null {
	if (!url?.trim()) return null;
	try {
		const parsed = new URL(url.trim());
		const parts = parsed.pathname.split("/").filter(Boolean);
		if (parts.length >= 2) {
			return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
		}
		if (parts.length === 1) return parts[0]!;
		return parsed.hostname.replace(/^www\./, "");
	} catch {
		const trimmed = url.trim();
		const slash = trimmed.lastIndexOf("/");
		if (slash >= 0 && slash < trimmed.length - 1) {
			return trimmed.slice(slash + 1);
		}
		return trimmed;
	}
}

type WorkItemStats = {
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

function parseWorkItemStats(project: Project): WorkItemStats {
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

export function ProjectCard({
	project,
	onToggleFavorite,
	favoritePending,
}: {
	project: Project;
	onToggleFavorite: (projectId: string) => void;
	favoritePending: boolean;
}) {
	const normalizedTitle = normalizeInlineText(project.title);
	const repoName = getRepoDisplayName(project.repo_url);
	const workItems = parseWorkItemStats(project);
	const progress =
		workItems.total > 0
			? Math.round((workItems.completed / workItems.total) * 100)
			: 0;
	const lowPercent =
		workItems.total > 0 ? (workItems.low / workItems.total) * 100 : 0;
	const mediumPercent =
		workItems.total > 0 ? (workItems.medium / workItems.total) * 100 : 0;
	const highPercent =
		workItems.total > 0 ? (workItems.high / workItems.total) * 100 : 0;

	return (
		<article className={cn("group", projectCardShellClass)}>
			<div className="flex min-h-0 flex-1 flex-col p-4 pb-3">
				<div className="flex items-start justify-between gap-2">
					<CircularProgressRing value={progress} />
					<div className="flex shrink-0 items-center gap-0.5">
						<button
							type="button"
							onClick={() => onToggleFavorite(project.id)}
							disabled={favoritePending}
							className={cn(
								"rounded-md p-1 text-text-secondary transition-colors hover:text-primary",
								favoritePending && "cursor-wait opacity-60",
							)}
							aria-label={
								project.is_favorite
									? "Remove from favorites"
									: "Add to favorites"
							}
						>
							{project.is_favorite ? (
								<MdFavorite className="h-[18px] w-[18px] text-primary" aria-hidden />
							) : (
								<MdFavoriteBorder className="h-[18px] w-[18px]" aria-hidden />
							)}
						</button>
						{project.repo_url ? (
							<a
								href={project.repo_url}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-md p-1 text-text-secondary transition-colors hover:text-primary"
								aria-label="Open repository"
							>
								<MdOpenInNew className="h-[18px] w-[18px]" aria-hidden />
							</a>
						) : null}
					</div>
				</div>

				<h3
					className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-text-primary"
					title={normalizedTitle}
				>
					{truncateProjectTitle(project.title)}
				</h3>

				{project.repo_url && repoName ? (
					<a
						href={project.repo_url}
						target="_blank"
						rel="noopener noreferrer"
						className="mt-0.5 block truncate text-sm text-text-secondary transition-colors hover:text-primary hover:underline"
						title={project.repo_url}
					>
						{repoName}
					</a>
				) : (
					<p className="mt-0.5 text-sm text-text-secondary">No repository linked</p>
				)}

				<div className="mt-2 flex flex-wrap items-center gap-1.5">
					<span
						className={cn(
							"inline-flex rounded border px-2 py-0.5 text-[11px] font-medium",
							statusClassMap[project.status],
						)}
					>
						{prettifyToken(project.status)}
					</span>
					{project.is_archived ? (
						<span className="inline-flex rounded border border-slate-500/40 px-2 py-0.5 text-[11px] font-medium text-slate-500">
							Archived
						</span>
					) : null}
				</div>

				<div className="mt-4 grid flex-1 grid-cols-2 gap-3">
					<div className="min-w-0">
						<p className="text-[11px] text-text-secondary">Work Items (%)</p>
						<div className="mt-1 flex items-center gap-1 text-sm font-medium text-text-primary">
							<span>{workItems.low}</span>
							<span className="text-text-secondary">·</span>
							<span>{workItems.medium}</span>
							<span className="text-text-secondary">·</span>
							<span>{workItems.high}</span>
						</div>
						<div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-tint">
							<div
								className="bg-sky-500"
								style={{ width: `${lowPercent}%` }}
								aria-hidden
							/>
							<div
								className="bg-cyan-400"
								style={{ width: `${mediumPercent}%` }}
								aria-hidden
							/>
							<div
								className="bg-red-500"
								style={{ width: `${highPercent}%` }}
								aria-hidden
							/>
						</div>
					</div>
					<div className="min-w-0">
						<p className="text-[11px] text-text-secondary">Tasks Completed</p>
						<div className="mt-1 flex items-center justify-between text-sm font-medium text-text-primary">
							<span>{progress}%</span>
							<span className="text-xs text-text-secondary">
								{workItems.completed}/{workItems.total}
							</span>
						</div>
						<div className="mt-1.5 h-1 overflow-hidden rounded-full bg-tint">
							<div
								className="h-full rounded-full bg-emerald-500"
								style={{ width: `${progress}%` }}
								aria-hidden
							/>
						</div>
					</div>
				</div>
			</div>

			<footer
				className={cn(
					"mt-auto grid shrink-0 grid-cols-2 gap-4 px-4 py-3",
					"bg-transparent transition-colors",
					"group-hover:bg-tint",
				)}
			>
				<div>
					<p className="text-xs text-text-secondary">Start Date:</p>
					<p className="mt-0.5 text-sm font-semibold text-text-primary">
						{formatDate(project.start_date)}
					</p>
				</div>
				<div>
					<p className="text-xs text-text-secondary">End Date:</p>
					<p className="mt-0.5 text-sm font-semibold text-text-primary">
						{formatDate(project.end_date)}
					</p>
				</div>
			</footer>
		</article>
	);
}

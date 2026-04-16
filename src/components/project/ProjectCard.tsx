import type { IconType } from "react-icons";
import {
	MdAccountBalanceWallet,
	MdCategory,
	MdFavorite,
	MdFavoriteBorder,
	MdFlightTakeoff,
	MdHomeWork,
	MdPalette,
	MdPersonOutline,
	MdRocketLaunch,
	MdSchool,
	MdWorkOutline,
} from "react-icons/md";

import { cn } from "@/lib/utils";
import type { Project, ProjectCategory, ProjectStatus } from "@/types/project";

const categoryIconMap: Record<ProjectCategory, IconType> = {
	WORK: MdWorkOutline,
	PERSONAL: MdPersonOutline,
	LEARNING: MdSchool,
	HEALTH: MdFavoriteBorder,
	FINANCE: MdAccountBalanceWallet,
	SIDE_PROJECT: MdRocketLaunch,
	CREATIVE: MdPalette,
	TRAVEL: MdFlightTakeoff,
	HOME: MdHomeWork,
	OTHER: MdCategory,
};

const statusClassMap: Record<ProjectStatus, string> = {
	ACTIVE: "bg-primary/15 text-primary",
	PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
	ON_HOLD: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
	COMPLETED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
	CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
	ARCHIVED: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
};

type WorkItemStats = {
	low: number;
	medium: number;
	high: number;
	completed: number;
	total: number;
};

function prettifyToken(value: string) {
	return value
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null): string {
	if (!value) return "Not set";
	try {
		return new Intl.DateTimeFormat(undefined, {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}).format(new Date(value));
	} catch {
		return value;
	}
}

const PROJECT_TITLE_MAX_CHARS = 56;
const PROJECT_DESCRIPTION_MAX_CHARS = 220;

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

function truncateDescription(value: string, maxChars = PROJECT_DESCRIPTION_MAX_CHARS) {
	return truncateText(value, maxChars);
}

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
	const CategoryIcon = categoryIconMap[project.category] ?? MdCategory;
	const normalizedTitle = normalizeInlineText(project.title);
	const normalizedDescription = project.description?.trim()
		? normalizeInlineText(project.description)
		: null;
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
		<article className="group flex h-[27rem] flex-col rounded-xl border border-primary/15 bg-background-secondary p-4 shadow-sm transition-colors hover:border-primary/30">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<div
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-tint"
						aria-hidden
					>
						<CategoryIcon className="h-5 w-5 text-primary" />
					</div>
					<div className="min-w-0">
						<h3
							className="h-12 overflow-hidden break-words text-base font-semibold leading-6 text-text-primary"
							title={normalizedTitle}
						>
							{truncateProjectTitle(project.title)}
						</h3>
						<span
							className={cn(
								"mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
								statusClassMap[project.status],
							)}
						>
							{prettifyToken(project.status)}
						</span>
					</div>
				</div>
				<div className="shrink-0 pt-0.5">
					<button
						type="button"
						onClick={() => onToggleFavorite(project.id)}
						disabled={favoritePending}
						className={cn(
							"rounded-md p-1.5 transition-colors hover:bg-primary/10",
							favoritePending && "cursor-wait opacity-60",
						)}
						aria-label={
							project.is_favorite
								? "Remove from favorites"
								: "Add to favorites"
						}
					>
						{project.is_favorite ? (
							<MdFavorite className="h-5 w-5 text-primary" aria-hidden />
						) : (
							<MdFavoriteBorder
								className="h-5 w-5 text-text-secondary"
								aria-hidden
							/>
						)}
					</button>
				</div>
			</div>

			<p
				className="mt-3 truncate text-sm leading-5 text-text-secondary"
				title={normalizedDescription ?? undefined}
			>
				{normalizedDescription
					? truncateDescription(normalizedDescription)
					: "No description added yet."}
			</p>

			<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="rounded-lg border border-primary/10 bg-tint p-3">
					<p className="text-xs text-text-secondary">Work Items (%)</p>
					<div className="mt-2 flex items-center gap-2 text-sm text-text-primary">
						<span className="font-medium">{workItems.low}</span>
						<span className="text-text-secondary">·</span>
						<span className="font-medium">{workItems.medium}</span>
						<span className="text-text-secondary">·</span>
						<span className="font-medium">{workItems.high}</span>
					</div>
					<div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-background-secondary">
						<div
							className="bg-sky-500"
							style={{ width: `${lowPercent}%` }}
							aria-hidden
						/>
						<div
							className="bg-orange-500"
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
				<div className="rounded-lg border border-primary/10 bg-tint p-3">
					<p className="text-xs text-text-secondary">Task Progress</p>
					<div className="mt-2 flex items-center justify-between text-sm">
						<span className="font-medium text-text-primary">
							{progress}%
						</span>
						<span className="text-text-secondary">
							{workItems.completed}/{workItems.total}
						</span>
					</div>
					<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-secondary">
						<div
							className="h-full rounded-full bg-emerald-500 transition-[width]"
							style={{ width: `${progress}%` }}
							aria-hidden
						/>
					</div>
				</div>
			</div>

			<div className="mt-4">
				<div className="grid grid-cols-2 gap-3 rounded-lg border border-primary/10 bg-tint p-3">
					<div>
						<p className="text-xs text-text-secondary">Start Date</p>
						<p className="mt-1 text-sm font-semibold text-text-primary">
							{formatDate(project.start_date)}
						</p>
					</div>
					<div>
						<p className="text-xs text-text-secondary">Due Date</p>
						<p className="mt-1 text-sm font-semibold text-text-primary">
							{formatDate(project.due_date)}
						</p>
					</div>
				</div>
			</div>
		</article>
	);
}

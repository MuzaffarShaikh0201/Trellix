import { useMemo, useState } from "react";
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryKey,
} from "@tanstack/react-query";
import type { IconType } from "react-icons";
import {
	MdAccountBalanceWallet,
	MdAdd,
	MdAddCircleOutline,
	MdCategory,
	MdFavorite,
	MdFavoriteBorder,
	MdFilterList,
	MdFlightTakeoff,
	MdHomeWork,
	MdPalette,
	MdPersonOutline,
	MdRocketLaunch,
	MdSchool,
	MdSort,
	MdWorkOutline,
} from "react-icons/md";

import Button from "@/components/ui/Button";
import { fetchProjects, toggleProjectFavorite } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type {
	Project,
	ProjectCategory,
	ProjectSortBy,
	ProjectSortOrder,
	ProjectStatus,
} from "@/types/project";

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

function ProjectCard({
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
		<article className="group flex min-h-72 flex-col rounded-xl border border-primary/15 bg-background-secondary p-4 shadow-sm transition-colors hover:border-primary/30">
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
							className="truncate text-base font-semibold text-text-primary"
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
				className="mt-3 break-words text-sm text-text-secondary"
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

			<div className="mt-auto pt-4">
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

function ProjectCardSkeleton() {
	return (
		<div className="min-h-72 animate-pulse rounded-xl border border-primary/10 bg-background-secondary p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-tint" />
					<div className="space-y-2">
						<div className="h-3 w-28 rounded bg-tint" />
						<div className="h-3 w-20 rounded bg-tint" />
					</div>
				</div>
				<div className="h-5 w-5 rounded bg-tint" />
			</div>
			<div className="mt-4 flex gap-2">
				<div className="h-6 w-20 rounded bg-tint" />
				<div className="h-6 w-24 rounded bg-tint" />
			</div>
			<div className="mt-4 space-y-2">
				<div className="h-3 w-full rounded bg-tint" />
				<div className="h-3 w-11/12 rounded bg-tint" />
				<div className="h-3 w-9/12 rounded bg-tint" />
			</div>
			<div className="mt-4 rounded-lg border border-primary/10 bg-tint p-3">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-2">
						<div className="h-3 w-20 rounded bg-background-secondary" />
						<div className="h-3 w-24 rounded bg-background-secondary" />
						<div className="h-1.5 w-full rounded bg-background-secondary" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-20 rounded bg-background-secondary" />
						<div className="h-3 w-24 rounded bg-background-secondary" />
						<div className="h-1.5 w-full rounded bg-background-secondary" />
					</div>
				</div>
			</div>
			<div className="mt-4 rounded-lg border border-primary/10 bg-tint p-3">
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-2">
						<div className="h-3 w-16 rounded bg-background-secondary" />
						<div className="h-3 w-20 rounded bg-background-secondary" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-16 rounded bg-background-secondary" />
						<div className="h-3 w-20 rounded bg-background-secondary" />
					</div>
				</div>
			</div>
		</div>
	);
}

function CreateProjectCard() {
	return (
		<article className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-background-secondary p-5 text-center shadow-sm">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tint">
				<MdAddCircleOutline className="h-10 w-10 text-primary" aria-hidden />
			</div>
			<h3 className="mt-4 text-lg font-semibold text-text-primary">
				Start a new project
			</h3>
			<p className="mt-2 text-sm text-text-secondary">
				Create and organize your next idea in Trellix.
			</p>
			<div className="mt-5 w-full max-w-[11rem]">
				<Button
					title="Create Project"
					onClick={() =>
						showAlert(
							"Coming soon",
							"info",
							"Project creation flow will be available soon.",
						)
					}
				/>
			</div>
		</article>
	);
}

export function ProjectsPage() {
	const queryClient = useQueryClient();
	const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
	const [sortBy, setSortBy] = useState<ProjectSortBy>("updated_at");
	const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("desc");

	const queryKey = useMemo(
		() =>
			[
				"projects",
				{
					page: 1,
					limit: 24,
					status: statusFilter,
					sort_by: sortBy,
					sort_order: sortOrder,
				},
			] satisfies QueryKey,
		[statusFilter, sortBy, sortOrder],
	);

	const {
		data,
		isPending,
		isError,
		error,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey,
		queryFn: () =>
			fetchProjects({
				page: 1,
				limit: 24,
				status: statusFilter === "ALL" ? undefined : statusFilter,
				sort_by: sortBy,
				sort_order: sortOrder,
			}),
	});

	const favoriteMutation = useMutation({
		mutationFn: toggleProjectFavorite,
		onMutate: async (projectId: string) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData<typeof data>(queryKey);
			queryClient.setQueryData<typeof data>(queryKey, (current) => {
				if (!current) return current;
				return {
					...current,
					projects: current.projects.map((project) =>
						project.id === projectId
							? { ...project, is_favorite: !project.is_favorite }
							: project,
					),
				};
			});
			return { previous };
		},
		onError: (err, _projectId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
			showAlert(
				"Could not update favorite",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating favorite status.",
				),
			);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey });
		},
	});

	const projects = data?.projects ?? [];

	return (
		<section className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Projects</h1>
					<p className="mt-1 text-sm text-text-secondary">
						Track all your projects in one place.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-2">
					<div className="text-sm text-text-secondary">
						{isPending
							? "Loading projects..."
							: `${data?.total_items ?? 0} total`}
					</div>
					<div className="relative">
						<MdFilterList
							className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
							aria-hidden
						/>
						<select
							value={statusFilter}
							onChange={(e) =>
								setStatusFilter(e.target.value as ProjectStatus | "ALL")
							}
							className={cn(
								"h-9 cursor-pointer appearance-none rounded-lg border border-primary/15 bg-background-secondary py-1.5 pl-8 pr-3 text-sm text-text-primary",
								"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
							)}
							aria-label="Filter projects by status"
						>
							<option value="ALL">All statuses</option>
							<option value="ACTIVE">Active</option>
							<option value="PENDING">Pending</option>
							<option value="ON_HOLD">On hold</option>
							<option value="COMPLETED">Completed</option>
							<option value="CANCELLED">Cancelled</option>
							<option value="ARCHIVED">Archived</option>
						</select>
					</div>
					<div className="relative">
						<MdSort
							className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
							aria-hidden
						/>
						<select
							value={`${sortBy}:${sortOrder}`}
							onChange={(e) => {
								const [nextSortBy, nextSortOrder] = e.target.value.split(":");
								setSortBy(nextSortBy as ProjectSortBy);
								setSortOrder(nextSortOrder as ProjectSortOrder);
							}}
							className={cn(
								"h-9 cursor-pointer appearance-none rounded-lg border border-primary/15 bg-background-secondary py-1.5 pl-8 pr-3 text-sm text-text-primary",
								"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
							)}
							aria-label="Sort projects"
						>
							<option value="updated_at:desc">Recently updated</option>
							<option value="created_at:desc">Recently created</option>
							<option value="title:asc">Title (A-Z)</option>
							<option value="title:desc">Title (Z-A)</option>
						</select>
					</div>
					<div className="w-full sm:w-auto">
						<Button
							title="Create Project"
							imgSrc={<MdAdd className="h-5 w-5" />}
							className="sm:min-w-40"
							onClick={() =>
								showAlert(
									"Coming soon",
									"info",
									"Project creation flow will be available soon.",
								)
							}
						/>
					</div>
				</div>
			</header>

			{isError ? (
				<div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
					<p className="text-sm font-medium text-red-600 dark:text-red-400">
						Could not load projects
					</p>
					<p className="mt-1 text-sm text-text-secondary">
						{getRequestErrorMessage(
							error,
							"Something went wrong while loading projects.",
						)}
					</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className="mt-3 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
					>
						Try again
					</button>
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{isPending
					? Array.from({ length: 5 }, (_, idx) => (
							<ProjectCardSkeleton key={`project-skeleton-${idx}`} />
						))
					: projects.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								onToggleFavorite={(projectId) =>
									favoriteMutation.mutate(projectId)
								}
								favoritePending={
									favoriteMutation.isPending &&
									favoriteMutation.variables === project.id
								}
							/>
						))}

				<CreateProjectCard />
			</div>

			{!isPending && !isError && projects.length === 0 ? (
				<p className="text-sm text-text-secondary">
					No projects found yet. Use the card above to create your first one.
				</p>
			) : null}

			{isRefetching && !isPending ? (
				<p className="text-xs text-text-secondary">Refreshing projects...</p>
			) : null}
		</section>
	);
}

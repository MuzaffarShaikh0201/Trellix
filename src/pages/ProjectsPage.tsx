import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
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
	MdChevronLeft,
	MdChevronRight,
	MdFavorite,
	MdFavoriteBorder,
	MdFilterList,
	MdFirstPage,
	MdFlightTakeoff,
	MdHomeWork,
	MdLastPage,
	MdClose,
	MdPalette,
	MdPersonOutline,
	MdRocketLaunch,
	MdSchool,
	MdSort,
	MdWorkOutline,
} from "react-icons/md";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { CustomLoader } from "@/components/ui/CustomLoader";
import { createProject, fetchProjects, toggleProjectFavorite } from "@/lib/api/projects";
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

const STATUS_FILTER_OPTIONS: { value: ProjectStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "All statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "PENDING", label: "Pending" },
	{ value: "ON_HOLD", label: "On hold" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
];

const CATEGORY_FILTER_OPTIONS: { value: ProjectCategory | "ALL"; label: string }[] = [
	{ value: "ALL", label: "All categories" },
	{ value: "WORK", label: "Work" },
	{ value: "PERSONAL", label: "Personal" },
	{ value: "LEARNING", label: "Learning" },
	{ value: "HEALTH", label: "Health" },
	{ value: "FINANCE", label: "Finance" },
	{ value: "SIDE_PROJECT", label: "Side project" },
	{ value: "CREATIVE", label: "Creative" },
	{ value: "TRAVEL", label: "Travel" },
	{ value: "HOME", label: "Home" },
	{ value: "OTHER", label: "Other" },
];

const CREATE_CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
	{ value: "WORK", label: "Work" },
	{ value: "PERSONAL", label: "Personal" },
	{ value: "LEARNING", label: "Learning" },
	{ value: "HEALTH", label: "Health" },
	{ value: "FINANCE", label: "Finance" },
	{ value: "SIDE_PROJECT", label: "Side project" },
	{ value: "CREATIVE", label: "Creative" },
	{ value: "TRAVEL", label: "Travel" },
	{ value: "HOME", label: "Home" },
	{ value: "OTHER", label: "Other" },
];

const SORT_BY_OPTIONS: { value: ProjectSortBy; label: string }[] = [
	{ value: "updated_at", label: "Recently updated" },
	{ value: "created_at", label: "Recently created" },
	{ value: "title", label: "Title" },
];

const SORT_ORDER_OPTIONS: { value: ProjectSortOrder; label: string }[] = [
	{ value: "asc", label: "Ascending" },
	{ value: "desc", label: "Descending" },
];

type ProjectTab = "ALL" | "FAVORITES" | "ARCHIVED";

const PROJECT_TABS: { value: ProjectTab; label: string }[] = [
	{ value: "ALL", label: "All" },
	{ value: "FAVORITES", label: "Favorites" },
	{ value: "ARCHIVED", label: "Archived" },
];

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

function CreateProjectCard({ onCreate }: { onCreate: () => void }) {
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
					onClick={onCreate}
				/>
			</div>
		</article>
	);
}

export function ProjectsPage() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<ProjectTab>("ALL");
	const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
	const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "ALL">("ALL");
	const [sortBy, setSortBy] = useState<ProjectSortBy>("updated_at");
	const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("desc");
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(12);
	const [filterModalOpen, setFilterModalOpen] = useState(false);
	const [sortModalOpen, setSortModalOpen] = useState(false);
	const filterRootRef = useRef<HTMLDivElement>(null);
	const sortRootRef = useRef<HTMLDivElement>(null);
	const controlsId = useId();

	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [createTitle, setCreateTitle] = useState("");
	const [createDescription, setCreateDescription] = useState("");
	const [createCategory, setCreateCategory] = useState<ProjectCategory>("WORK");
	const [createStartDate, setCreateStartDate] = useState("");
	const [createDueDate, setCreateDueDate] = useState("");
	const [createSubmitting, setCreateSubmitting] = useState(false);
	const effectiveStatusFilter: ProjectStatus | undefined =
		activeTab === "ARCHIVED"
			? "ARCHIVED"
			: statusFilter === "ALL"
				? undefined
				: statusFilter;
	const favoriteOnly = activeTab === "FAVORITES" ? true : undefined;

	const queryKey = useMemo(
		() =>
			[
				"projects",
				{
					tab: activeTab,
					page,
					limit: rowsPerPage,
					status: effectiveStatusFilter,
					category: categoryFilter,
					is_favorite: favoriteOnly,
					sort_by: sortBy,
					sort_order: sortOrder,
				},
			] satisfies QueryKey,
		[
			activeTab,
			page,
			rowsPerPage,
			effectiveStatusFilter,
			categoryFilter,
			favoriteOnly,
			sortBy,
			sortOrder,
		],
	);

	useEffect(() => {
		function onPointerDown(event: PointerEvent) {
			const target = event.target as Node;
			if (
				filterModalOpen &&
				filterRootRef.current &&
				!filterRootRef.current.contains(target)
			) {
				setFilterModalOpen(false);
			}
			if (
				sortModalOpen &&
				sortRootRef.current &&
				!sortRootRef.current.contains(target)
			) {
				setSortModalOpen(false);
			}
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setFilterModalOpen(false);
				setSortModalOpen(false);
				setCreateModalOpen(false);
			}
		}

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [filterModalOpen, sortModalOpen, createModalOpen]);

	useEffect(() => {
		if (!createModalOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [createModalOpen]);

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
				page,
				limit: rowsPerPage,
				status: effectiveStatusFilter,
				category: categoryFilter === "ALL" ? undefined : categoryFilter,
				is_favorite: favoriteOnly,
				sort_by: sortBy,
				sort_order: sortOrder,
			}),
		placeholderData: (prev) => prev,
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
	const totalItems = data?.total_items ?? 0;
	const totalPages = Math.max(1, data?.total_pages ?? 1);
	const currentPage = Math.min(page, totalPages);
	const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
	const endItem = Math.min(currentPage * rowsPerPage, totalItems);

	const canGoPrev = currentPage > 1;
	const canGoNext = currentPage < totalPages;
	function resetCreateForm() {
		setCreateTitle("");
		setCreateDescription("");
		setCreateCategory("WORK");
		setCreateStartDate("");
		setCreateDueDate("");
	}

	function openCreateModal() {
		setFilterModalOpen(false);
		setSortModalOpen(false);
		setCreateModalOpen(true);
	}

	function closeCreateModal() {
		setCreateModalOpen(false);
		setCreateSubmitting(false);
		resetCreateForm();
	}

	function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const title = createTitle.trim();
		if (!title) {
			showAlert("Validation Error", "warning", "Project title is required.");
			return;
		}
		if (!createStartDate) {
			showAlert(
				"Validation Error",
				"warning",
				"Start date is required.",
			);
			return;
		}

		setCreateSubmitting(true);
		void (async () => {
			try {
				await createProject({
					title,
					description: createDescription.trim() || null,
					category: createCategory,
					status: "PENDING",
					start_date: createStartDate,
					due_date: createDueDate || null,
				});
				showAlert(
					"Project created",
					"success",
					"Your project has been created.",
				);

				// Refresh current tab results.
				await queryClient.invalidateQueries({ queryKey: ["projects"] });
				closeCreateModal();
			} catch (err) {
				showAlert(
					"Create failed",
					"error",
					getRequestErrorMessage(
						err,
						"Something went wrong while creating your project.",
					),
				);
			} finally {
				setCreateSubmitting(false);
			}
		})();
	}

	const handleCreateProjectClick = openCreateModal;
	const emptyStateMessage =
		activeTab === "FAVORITES"
			? "No favorite projects found yet."
			: activeTab === "ARCHIVED"
				? "No archived projects found yet."
				: "No projects found yet. Use the card above to create your first one.";

	return (
		<section className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Projects</h1>
					<p className="mt-1 text-sm text-text-secondary">
						Track all your projects in one place.
					</p>
					<div className="mt-3 flex items-center gap-1 border-b border-primary/10">
						{PROJECT_TABS.map((tab) => {
							const isActive = activeTab === tab.value;
							return (
								<button
									key={tab.value}
									type="button"
									onClick={() => {
										setActiveTab(tab.value);
										setPage(1);
									}}
									className={cn(
										"-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
										isActive
											? "border-primary text-primary"
											: "border-transparent text-text-secondary hover:text-text-primary",
									)}
									aria-pressed={isActive}
								>
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>
				<div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
					<div className="whitespace-nowrap text-xs text-text-secondary sm:text-sm">
						{isPending
							? "Loading projects..."
							: `${totalItems} total`}
					</div>
					<div ref={filterRootRef} className="relative">
						<button
							type="button"
							onClick={() => {
								setFilterModalOpen((v) => !v);
								setSortModalOpen(false);
							}}
							className="flex h-9 w-9 cursor-pointer items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
							title="Open filters"
							aria-label="Open filters"
							aria-haspopup="dialog"
							aria-expanded={filterModalOpen}
							aria-controls={filterModalOpen ? `${controlsId}-filter-modal` : undefined}
						>
							<MdFilterList className="h-5 w-5" aria-hidden />
						</button>
						{filterModalOpen ? (
							<div
								id={`${controlsId}-filter-modal`}
								role="dialog"
								aria-label="Filter projects"
								className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,19rem)] rounded-xl border border-primary/10 bg-background-secondary p-4 shadow-lg"
							>
								<p className="text-sm font-semibold text-text-primary">Filters</p>
								<div className="mt-3 space-y-3">
									{activeTab !== "ARCHIVED" ? (
										<div>
											<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
												Status
											</label>
											<select
												value={statusFilter}
												onChange={(e) => {
													setStatusFilter(
														e.target.value as ProjectStatus | "ALL",
													);
													setPage(1);
												}}
												className={cn(
													"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
													"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
												)}
												aria-label="Filter projects by status"
											>
												{STATUS_FILTER_OPTIONS.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</div>
									) : null}
									<div>
										<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
											Category
										</label>
										<select
											value={categoryFilter}
											onChange={(e) => {
												setCategoryFilter(
													e.target.value as ProjectCategory | "ALL",
												);
												setPage(1);
											}}
											className={cn(
												"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
												"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
											)}
											aria-label="Filter projects by category"
										>
											{CATEGORY_FILTER_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						) : null}
					</div>
					<div ref={sortRootRef} className="relative">
						<button
							type="button"
							onClick={() => {
								setSortModalOpen((v) => !v);
								setFilterModalOpen(false);
							}}
							className="flex h-9 w-9 cursor-pointer items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
							title="Open sorting options"
							aria-label="Open sorting options"
							aria-haspopup="dialog"
							aria-expanded={sortModalOpen}
							aria-controls={sortModalOpen ? `${controlsId}-sort-modal` : undefined}
						>
							<MdSort className="h-5 w-5" aria-hidden />
						</button>
						{sortModalOpen ? (
							<div
								id={`${controlsId}-sort-modal`}
								role="dialog"
								aria-label="Sort projects"
								className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,19rem)] rounded-xl border border-primary/10 bg-background-secondary p-4 shadow-lg"
							>
								<p className="text-sm font-semibold text-text-primary">Sorting</p>
								<div className="mt-3 space-y-3">
									<div>
										<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
											Sort by
										</label>
										<select
											value={sortBy}
											onChange={(e) => {
												setSortBy(e.target.value as ProjectSortBy);
												setPage(1);
											}}
											className={cn(
												"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
												"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
											)}
											aria-label="Sort projects by field"
										>
											{SORT_BY_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
											Order
										</label>
										<select
											value={sortOrder}
											onChange={(e) => {
												setSortOrder(e.target.value as ProjectSortOrder);
												setPage(1);
											}}
											className={cn(
												"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
												"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
											)}
											aria-label="Sort order"
										>
											{SORT_ORDER_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						) : null}
					</div>
					<div className="w-auto">
						<button
							type="button"
							aria-label="Create Project"
							title="Create Project"
							onClick={handleCreateProjectClick}
							className={cn(
								"flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-primary bg-primary text-white transition-colors hover:bg-blue-600",
								"sm:hidden",
							)}
						>
							<MdAdd className="h-5 w-5" aria-hidden />
						</button>
						<Button
							title="Create Project"
							imgSrc={<MdAdd className="h-5 w-5" />}
							className="hidden sm:min-w-40 sm:block"
							onClick={handleCreateProjectClick}
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
					? Array.from({ length: Math.min(6, rowsPerPage) }, (_, idx) => (
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

				{activeTab === "ALL" ? (
					<CreateProjectCard onCreate={handleCreateProjectClick} />
				) : null}
			</div>

			{!isPending && !isError && projects.length === 0 ? (
				<p className="text-sm text-text-secondary">
					{emptyStateMessage}
				</p>
			) : null}

			{isRefetching && !isPending ? (
				<p className="text-xs text-text-secondary">Refreshing projects...</p>
			) : null}

			{!isError && totalItems > 0 ? (
				<footer className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-primary/10 bg-background-secondary p-3 text-sm text-text-secondary">
					<div className="flex items-center gap-2">
						<label htmlFor="projects-rows-per-page">Rows per page</label>
						<select
							id="projects-rows-per-page"
							value={rowsPerPage}
							onChange={(e) => {
								setRowsPerPage(Number(e.target.value));
								setPage(1);
							}}
							className={cn(
								"h-8 cursor-pointer rounded-md border border-primary/15 bg-background-secondary px-2 text-sm text-text-primary",
								"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
							)}
						>
							<option value={6}>6</option>
							<option value={12}>12</option>
							<option value={24}>24</option>
							<option value={36}>36</option>
						</select>
					</div>

					<div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
						<p className="min-w-24 text-right tabular-nums">
							{startItem}-{endItem} of {totalItems}
						</p>

						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setPage(1)}
								disabled={!canGoPrev}
								className={cn(
									"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
									!canGoPrev && "cursor-not-allowed opacity-40",
								)}
								aria-label="First page"
							>
								<MdFirstPage className="h-5 w-5" aria-hidden />
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={!canGoPrev}
								className={cn(
									"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
									!canGoPrev && "cursor-not-allowed opacity-40",
								)}
								aria-label="Previous page"
							>
								<MdChevronLeft className="h-5 w-5" aria-hidden />
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={!canGoNext}
								className={cn(
									"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
									!canGoNext && "cursor-not-allowed opacity-40",
								)}
								aria-label="Next page"
							>
								<MdChevronRight className="h-5 w-5" aria-hidden />
							</button>
							<button
								type="button"
								onClick={() => setPage(totalPages)}
								disabled={!canGoNext}
								className={cn(
									"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
									!canGoNext && "cursor-not-allowed opacity-40",
								)}
								aria-label="Last page"
							>
								<MdLastPage className="h-5 w-5" aria-hidden />
							</button>
						</div>
					</div>
				</footer>
			) : null}

			{createModalOpen ? (
				<div
					className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[1px]"
					role="presentation"
					onClick={() => closeCreateModal()}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-label="Create project"
						onClick={(e) => e.stopPropagation()}
						className={cn(
							"absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary/10 bg-background-secondary p-5 shadow-lg sm:p-6",
						)}
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
									Create project
								</p>
								<h2 className="mt-2 text-xl font-bold text-text-primary">
									New project
								</h2>
								<p className="mt-1 text-sm text-text-secondary">
									Add details to organize your work.
								</p>
							</div>
							<button
								type="button"
								onClick={() => closeCreateModal()}
								className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-tint hover:text-text-primary"
								aria-label="Close create project modal"
							>
								<MdClose className="h-5 w-5" aria-hidden />
							</button>
						</div>

						<form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<FormField
										title="Title"
										placeholder="e.g. Build the Trellix dashboard"
										type="text"
										value={createTitle}
										handleChange={(e) => setCreateTitle(e.target.value)}
										autoComplete="off"
									/>
								</div>

								<div className="sm:col-span-2">
									<FormField
										title="Description"
										placeholder="Short description (optional)"
										type="text"
										value={createDescription}
										handleChange={(e) =>
											setCreateDescription(e.target.value)
										}
										autoComplete="off"
									/>
								</div>

								<div>
									<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
										Category
									</label>
									<select
										value={createCategory}
										onChange={(e) =>
											setCreateCategory(e.target.value as ProjectCategory)
										}
										className={cn(
											"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
											"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
										)}
										aria-label="Project category"
									>
										{CREATE_CATEGORY_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>

								<div>
									<FormField
										title="Start date"
										placeholder=""
										type="date"
										value={createStartDate}
										handleChange={(e) => setCreateStartDate(e.target.value)}
									/>
								</div>

								<div>
									<FormField
										title="Due date"
										placeholder=""
										type="date"
										value={createDueDate}
										handleChange={(e) => setCreateDueDate(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={() => closeCreateModal()}
									className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
								>
									Cancel
								</button>
								<div className="w-full sm:w-40">
									<Button
										type="submit"
										title="Create Project"
										disabled={createSubmitting}
										loading={createSubmitting}
										loader={
											<CustomLoader
												size={24}
												color="#ffffff"
												containerStyle={{ width: 24, height: 24 }}
												aria-label="Creating project"
											/>
										}
									/>
								</div>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</section>
	);
}

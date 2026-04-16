import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryKey,
} from "@tanstack/react-query";
import {
	MdAdd,
	MdFilterList,
	MdSort,
} from "react-icons/md";

import { CreateProjectCard } from "@/components/project/CreateProjectCard";
import { CreateProjectModal } from "@/components/project/CreateProjectModal";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import Button from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { createProject, fetchProjects, toggleProjectFavorite } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type {
	ProjectCategory,
	ProjectSortBy,
	ProjectSortOrder,
	ProjectStatus,
} from "@/types/project";

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

export function ProjectsPage() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<ProjectTab>("ALL");
	const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
	const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "ALL">("ALL");
	const [sortBy, setSortBy] = useState<ProjectSortBy>("updated_at");
	const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("desc");
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(6);
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

			<div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{isPending
					? Array.from({ length: rowsPerPage }, (_, idx) => (
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
				<Pagination
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(next) => {
						setRowsPerPage(next);
						setPage(1);
					}}
					startItem={startItem}
					endItem={endItem}
					totalItems={totalItems}
					canGoPrev={canGoPrev}
					canGoNext={canGoNext}
					onFirstPage={() => setPage(1)}
					onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
					onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
					onLastPage={() => setPage(totalPages)}
					pageSizeSelectId="projects-rows-per-page"
				/>
			) : null}

			<CreateProjectModal
				open={createModalOpen}
				onClose={closeCreateModal}
				onSubmit={handleCreateSubmit}
				title={createTitle}
				description={createDescription}
				category={createCategory}
				startDate={createStartDate}
				dueDate={createDueDate}
				onTitleChange={(e) => setCreateTitle(e.target.value)}
				onDescriptionChange={(e) => setCreateDescription(e.target.value)}
				onCategoryChange={(e) => setCreateCategory(e.target.value as ProjectCategory)}
				onStartDateChange={(e) => setCreateStartDate(e.target.value)}
				onDueDateChange={(e) => setCreateDueDate(e.target.value)}
				categoryOptions={CREATE_CATEGORY_OPTIONS}
				submitting={createSubmitting}
			/>
		</section>
	);
}

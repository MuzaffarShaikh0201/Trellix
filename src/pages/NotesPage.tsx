import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryKey,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FaFilter, FaSort } from "react-icons/fa6";
import { MdAdd } from "react-icons/md";

import { CreateNoteCard } from "@/components/note/CreateNoteCard";
import { NoteCard } from "@/components/note/NoteCard";
import { NoteCardSkeleton } from "@/components/note/NoteCardSkeleton";
import Button from "@/components/ui/Button";
import {
	buttonPrimaryClass,
	buttonSecondaryClass,
} from "@/components/ui/buttonStyles";
import { Pagination } from "@/components/ui/Pagination";
import { fetchNotes, toggleNotePinned } from "@/lib/api/notes";
import { fetchProjects } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type { NoteSortBy, NoteSortOrder } from "@/types/note";

type NoteTab = "ALL" | "PERSONAL";

const NOTE_TABS: { value: NoteTab; label: string }[] = [
	{ value: "ALL", label: "All" },
	{ value: "PERSONAL", label: "Personal" },
];

const SORT_BY_OPTIONS: { value: NoteSortBy; label: string }[] = [
	{ value: "updated_at", label: "Recently updated" },
	{ value: "created_at", label: "Recently created" },
	{ value: "title", label: "Title" },
];

const SORT_ORDER_OPTIONS: { value: NoteSortOrder; label: string }[] = [
	{ value: "asc", label: "Ascending" },
	{ value: "desc", label: "Descending" },
];

const DEFAULT_PAGE_LIMIT = 10;

const PAGE_LIMIT_OPTIONS = [6, 8, 10, 12, 16, 20] as const;

const PROJECT_PICKER_QUERY_KEY = ["projects", "picker"] as const;

export function NotesPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<NoteTab>("ALL");
	const [projectFilter, setProjectFilter] = useState<string>("ALL");
	const [sortBy, setSortBy] = useState<NoteSortBy>("updated_at");
	const [sortOrder, setSortOrder] = useState<NoteSortOrder>("desc");
	const [page, setPage] = useState(1);
	const [pageLimit, setPageLimit] = useState<number>(DEFAULT_PAGE_LIMIT);
	const [filterModalOpen, setFilterModalOpen] = useState(false);
	const [sortModalOpen, setSortModalOpen] = useState(false);
	const filterRootRef = useRef<HTMLDivElement>(null);
	const sortRootRef = useRef<HTMLDivElement>(null);
	const controlsId = useId();

	const personalOnly = activeTab === "PERSONAL" ? true : undefined;
	const effectiveProjectId =
		activeTab === "PERSONAL" || projectFilter === "ALL"
			? undefined
			: projectFilter;

	const queryKey = useMemo(
		() =>
			[
				"notes",
				{
					tab: activeTab,
					page,
					limit: pageLimit,
					project_id: effectiveProjectId,
					personal: personalOnly,
					sort_by: sortBy,
					sort_order: sortOrder,
				},
			] satisfies QueryKey,
		[
			activeTab,
			page,
			pageLimit,
			effectiveProjectId,
			personalOnly,
			sortBy,
			sortOrder,
		],
	);

	const { data: projectsPickerData, isPending: projectsPickerPending } =
		useQuery({
			queryKey: PROJECT_PICKER_QUERY_KEY,
			queryFn: () =>
				fetchProjects({
					limit: 100,
					sort_by: "title",
					sort_order: "asc",
					is_archived: false,
				}),
		});

	const projectOptions = useMemo(
		() =>
			(projectsPickerData?.projects ?? []).map((p) => ({
				id: p.id,
				title: p.title,
			})),
		[projectsPickerData?.projects],
	);

	const projectColorById = useMemo(() => {
		const map = new Map<string, string | null>();
		for (const project of projectsPickerData?.projects ?? []) {
			map.set(project.id, project.color);
		}
		return map;
	}, [projectsPickerData?.projects]);

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
			}
		}

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [filterModalOpen, sortModalOpen]);

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
			fetchNotes({
				page,
				limit: pageLimit,
				project_id: effectiveProjectId,
				personal: personalOnly,
				sort_by: sortBy,
				sort_order: sortOrder,
			}),
	});

	const pinMutation = useMutation({
		mutationFn: toggleNotePinned,
		onMutate: async (noteId: string) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData<typeof data>(queryKey);
			queryClient.setQueryData<typeof data>(queryKey, (current) => {
				if (!current) return current;
				return {
					...current,
					notes: current.notes.map((note) =>
						note.id === noteId
							? { ...note, is_pinned: !note.is_pinned }
							: note,
					),
				};
			});
			return { previous };
		},
		onError: (err, _noteId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
			showAlert(
				"Could not update pin",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating pin status.",
				),
			);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});

	const notes = data?.notes ?? [];
	const totalItems = data?.total_items ?? 0;
	const totalPages = Math.max(1, data?.total_pages ?? 1);
	const currentPage = Math.min(page, totalPages);
	const startItem =
		totalItems === 0 ? 0 : (currentPage - 1) * pageLimit + 1;
	const endItem = Math.min(currentPage * pageLimit, totalItems);

	const canGoPrev = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	function goToCreate() {
		setFilterModalOpen(false);
		setSortModalOpen(false);
		navigate("/notes/new");
	}

	const emptyStateMessage =
		activeTab === "PERSONAL"
			? "No personal notes found yet."
			: projectFilter !== "ALL"
				? "No notes found for this project."
				: "No notes found yet. Use the card above to create your first one.";

	const showCreateCard = activeTab === "ALL";

	const panelBarClass =
		"shrink-0 border-primary/10 bg-tint px-4 py-1 text-[10px] leading-tight text-text-secondary md:px-6 sm:text-xs";

	return (
		<section className="flex min-h-0 flex-1 flex-col gap-4">
			<header>
				<h1 className="text-2xl font-bold text-text-primary">Notes</h1>
				<p className="mt-1 text-sm text-text-secondary">
					Capture ideas, meeting notes, and documentation for your
					projects.
				</p>
				<div className="mt-3 flex items-center justify-between gap-3">
					<div className="flex items-center gap-1">
						{NOTE_TABS.map((tab) => {
							const isActive = activeTab === tab.value;
							return (
								<button
									key={tab.value}
									type="button"
									onClick={() => {
										setActiveTab(tab.value);
										setPage(1);
										if (tab.value === "PERSONAL") {
											setProjectFilter("ALL");
										}
									}}
									className={cn(
										"border-b-2 px-3 py-2 text-sm font-medium transition-colors",
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
					<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
						<button
							type="button"
							aria-label="Create Note"
							title="Create Note"
							onClick={goToCreate}
							className={cn(
								buttonPrimaryClass("h-8 w-8 shrink-0 p-0 sm:hidden"),
							)}
						>
							<MdAdd className="h-4 w-4" aria-hidden />
						</button>
						<Button
							title="Create Note"
							variant="primary"
							imgSrc={<MdAdd className="h-4 w-4" aria-hidden />}
							className="hidden w-auto sm:inline-flex"
							onClick={goToCreate}
						/>
					</div>
				</div>
			</header>

			<div
				className={cn(
					"flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-primary/10",
					"bg-background-secondary",
				)}
			>
				<div
					className={cn(
						panelBarClass,
						"relative z-10 flex flex-wrap items-center justify-between gap-3 border-b shadow-panel-below",
					)}
				>
					<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
						<span className="whitespace-nowrap tabular-nums">
							{isPending ? "Loading notes..." : `${totalItems} total`}
						</span>
						{isRefetching && !isPending ? (
							<span>Refreshing…</span>
						) : null}
					</div>
					<div className="ml-auto flex shrink-0 items-center justify-end gap-1">
						<div ref={filterRootRef} className="relative">
							<button
								type="button"
								onClick={() => {
									setFilterModalOpen((v) => !v);
									setSortModalOpen(false);
								}}
								disabled={activeTab === "PERSONAL"}
								className={cn(
									"flex h-6 w-6 cursor-pointer items-center justify-center text-text-secondary transition-colors hover:text-text-primary",
									activeTab === "PERSONAL" &&
										"cursor-not-allowed opacity-40",
								)}
								title="Open filters"
								aria-label="Open filters"
								aria-haspopup="dialog"
								aria-expanded={filterModalOpen}
								aria-controls={
									filterModalOpen
										? `${controlsId}-filter-modal`
										: undefined
								}
							>
								<FaFilter className="h-4 w-4" aria-hidden />
							</button>
							{filterModalOpen ? (
								<div
									id={`${controlsId}-filter-modal`}
									role="dialog"
									aria-label="Filter notes"
									className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,19rem)] rounded-xl border border-primary/10 bg-background-secondary p-4 shadow-lg"
								>
									<p className="text-sm font-semibold text-text-primary">
										Filters
									</p>
									<div className="mt-3 space-y-3">
										<div>
											<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
												Project
											</label>
											<select
												value={projectFilter}
												onChange={(e) => {
													setProjectFilter(e.target.value);
													setPage(1);
												}}
												disabled={projectsPickerPending}
												className={cn(
													"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
													"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
												)}
												aria-label="Filter notes by project"
											>
												<option value="ALL">All projects</option>
												{projectOptions.map((project) => (
													<option key={project.id} value={project.id}>
														{project.title}
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
								className="flex h-6 w-6 cursor-pointer items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
								title="Open sorting options"
								aria-label="Open sorting options"
								aria-haspopup="dialog"
								aria-expanded={sortModalOpen}
								aria-controls={
									sortModalOpen ? `${controlsId}-sort-modal` : undefined
								}
							>
								<FaSort className="h-4 w-4" aria-hidden />
							</button>
							{sortModalOpen ? (
								<div
									id={`${controlsId}-sort-modal`}
									role="dialog"
									aria-label="Sort notes"
									className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,19rem)] rounded-xl border border-primary/10 bg-background-secondary p-4 shadow-lg"
								>
									<p className="text-sm font-semibold text-text-primary">
										Sorting
									</p>
									<div className="mt-3 space-y-3">
										<div>
											<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
												Sort by
											</label>
											<select
												value={sortBy}
												onChange={(e) => {
													setSortBy(e.target.value as NoteSortBy);
													setPage(1);
												}}
												className={cn(
													"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
													"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
												)}
												aria-label="Sort notes by field"
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
													setSortOrder(
														e.target.value as NoteSortOrder,
													);
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
					</div>
				</div>

				<div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
					{isError ? (
						<div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
							<p className="text-sm font-medium text-red-600 dark:text-red-400">
								Could not load notes
							</p>
							<p className="mt-1 text-sm text-text-secondary">
								{getRequestErrorMessage(
									error,
									"Something went wrong while loading notes.",
								)}
							</p>
							<button
								type="button"
								onClick={() => void refetch()}
								className={cn("mt-3", buttonSecondaryClass())}
							>
								Try again
							</button>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
								{isPending
									? Array.from({ length: pageLimit }, (_, idx) => (
											<NoteCardSkeleton key={`note-skeleton-${idx}`} />
										))
									: (
										<>
											{notes.map((note) => (
												<NoteCard
													key={note.id}
													note={note}
													projectColor={
														note.project
															? projectColorById.get(note.project.id)
															: undefined
													}
													onTogglePinned={(noteId) =>
														pinMutation.mutate(noteId)
													}
													pinPending={
														pinMutation.isPending &&
														pinMutation.variables === note.id
													}
												/>
											))}
											{showCreateCard ? (
												<CreateNoteCard onCreate={goToCreate} />
											) : null}
										</>
									)}
							</div>

							{!isPending && notes.length === 0 ? (
								<p className="mt-4 text-sm text-text-secondary">
									{emptyStateMessage}
								</p>
							) : null}
						</>
					)}
				</div>

				{!isError && !isPending ? (
					<Pagination
						className={cn(
							panelBarClass,
							"relative z-10 border-t shadow-panel-above",
						)}
						startItem={startItem}
						endItem={endItem}
						totalItems={totalItems}
						canGoPrev={canGoPrev}
						canGoNext={canGoNext}
						pageLimit={pageLimit}
						pageLimitOptions={[...PAGE_LIMIT_OPTIONS]}
						onPageLimitChange={(limit) => {
							setPageLimit(limit);
							setPage(1);
						}}
						onFirstPage={() => setPage(1)}
						onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
						onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
						onLastPage={() => setPage(totalPages)}
					/>
				) : null}
			</div>
		</section>
	);
}

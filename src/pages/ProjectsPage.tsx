import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import {
	LuArchive,
	LuArrowUpDown,
	LuFolderSearch,
	LuLayoutGrid,
	LuList,
	LuPlus,
	LuSearch,
	LuSquareKanban,
	LuStar,
} from "react-icons/lu";

import { Page, PageHeader } from "@/components/layout/AppShell";
import { useShell } from "@/components/layout/shell-context";
import { FavoriteStar, ProjectBoardCard, ProjectCard, TaskProgressChip } from "@/components/project/ProjectCard";
import { ProjectRepoBadge } from "@/components/project/ProjectRepoBadge";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { DueLabel, TimelineBar } from "@/components/project/ProjectTimeline";
import { ProjectTile } from "@/components/project/ProjectTile";
import Button from "@/components/ui/Button";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { EmptyState, ErrorState, Skeleton, cardClass } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { pageInfo } from "@/lib/pagination";
import { Segmented } from "@/components/ui/Segmented";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { inputClass } from "@/components/ui/fieldStyles";
import { fetchProjects } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { formatDay, timeAgo } from "@/lib/project/projectDisplay";
import { PROJECT_STATUSES, PROJECT_STATUS_META } from "@/lib/project/projectStatusStyles";
import {
	MAX_PAGE_LIMIT,
	MAX_PAGES,
	fetchAllPages,
	projectKeys,
	useProjectStatusCounts,
	useSetProjectStatus,
	useToggleFavorite,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { GetProjectsParams, GetProjectsResponse, Project, ProjectSortBy, ProjectSortOrder, ProjectStatus } from "@/types/project";

type View = "grid" | "list" | "board";

const SORTS: { value: string; label: string; by: ProjectSortBy; order: ProjectSortOrder }[] = [
	{ value: "updated_at:desc", label: "Last updated", by: "updated_at", order: "desc" },
	{ value: "created_at:desc", label: "Newest first", by: "created_at", order: "desc" },
	{ value: "title:asc", label: "Title A–Z", by: "title", order: "asc" },
	{ value: "end_date:asc", label: "Due date", by: "end_date", order: "asc" },
	{ value: "start_date:asc", label: "Start date", by: "start_date", order: "asc" },
];

const PAGE_SIZES = [12, 24, 48];

function readParams(sp: URLSearchParams) {
	const status = sp.get("status");
	const view = sp.get("view");
	const sort = SORTS.find((s) => s.value === sp.get("sort")) ?? SORTS[0];
	const limit = Number(sp.get("limit"));
	return {
		status: (PROJECT_STATUSES as string[]).includes(status ?? "") ? (status as ProjectStatus) : undefined,
		view: (["grid", "list", "board"].includes(view ?? "") ? view : "grid") as View,
		q: (sp.get("q") ?? "").trim(),
		favorites: sp.get("fav") === "1",
		archived: sp.get("archived") === "1",
		sort,
		page: Math.max(1, Number(sp.get("page")) || 1),
		limit: PAGE_SIZES.includes(limit) ? limit : PAGE_SIZES[0],
	};
}

export function ProjectsPage() {
	const [sp, setSp] = useSearchParams();
	const state = readParams(sp);
	const { openCreateProject } = useShell();
	const favorite = useToggleFavorite();
	const canDrag = useMediaQuery("(pointer: fine)");

	/** Updates URL params; anything other than `page` resets to page 1. */
	function update(patch: Record<string, string | null>) {
		setSp(
			(prev) => {
				const next = new URLSearchParams(prev);
				for (const [k, v] of Object.entries(patch)) {
					if (v === null || v === "") next.delete(k);
					else next.set(k, v);
				}
				if (!("page" in patch)) next.delete("page");
				return next;
			},
			{ replace: true },
		);
	}

	const filters = {
		is_archived: state.archived ? true : undefined,
		is_favorite: state.favorites ? true : undefined,
	};
	const { counts } = useProjectStatusCounts(filters);
	const isBoard = state.view === "board";

	const params: GetProjectsParams = isBoard
		? { ...filters, q: state.q || undefined, limit: MAX_PAGE_LIMIT, sort_by: state.sort.by, sort_order: state.sort.order }
		: {
				...filters,
				q: state.q || undefined,
				status: state.status,
				page: state.page,
				limit: state.limit,
				sort_by: state.sort.by,
				sort_order: state.sort.order,
			};

	const query = useQuery({
		queryKey: [...projectKeys.list(params), isBoard ? "all-pages" : "page"],
		// The board needs every project, so it loads all pages; grid/list load one page.
		queryFn: () =>
			isBoard
				? fetchAllPages<GetProjectsResponse>((page) => fetchProjects({ ...params, page }), "projects")
				: fetchProjects(params).then((r) => ({ ...r, truncated: false })),
		placeholderData: keepPreviousData,
	});

	const projects = query.data?.projects ?? [];
	const info = pageInfo(state.page, state.limit, query.data?.total_items ?? 0, query.data?.total_pages ?? 1);
	const favProps = {
		onToggleFavorite: (id: string) => favorite.mutate(id),
		favoritePending: favorite.isPending,
	};
	const filtersActive = Boolean(state.status || state.favorites || state.q);

	const subtitle = state.q
		? `${query.data?.total_items ?? "…"} results for “${state.q}”`
		: state.archived
		? `${counts.ALL ?? "…"} archived projects`
		: state.favorites
			? `${counts.ALL ?? "…"} favorite projects`
			: `${counts.ALL ?? "…"} active projects`;

	return (
		<Page>
			<PageHeader
				title={state.archived ? "Archived projects" : "Projects"}
				subtitle={subtitle}
				actions={
					<Button icon={<LuPlus className="size-4" />} onClick={openCreateProject}>
						New project
					</Button>
				}
			/>

			<div className="mt-5 flex flex-wrap items-center gap-1.5">
				<SearchBox
					key={state.q}
					initial={state.q}
					onSearch={(q) => update({ q: q || null })}
				/>
				<button
					type="button"
					onClick={() => update({ fav: state.favorites ? null : "1" })}
					title="Favorites"
					aria-pressed={state.favorites}
					className={buttonSecondaryClass(
						cn("py-1.5", state.favorites && "border-amber-400/60 text-amber-600 dark:text-amber-400"),
					)}
				>
					<LuStar className={cn("size-4", state.favorites && "fill-amber-400 text-amber-400")} />
					<span className="max-sm:hidden">Favorites</span>
				</button>
				<button
					type="button"
					onClick={() => update({ archived: state.archived ? null : "1", status: null })}
					title="Archived"
					aria-pressed={state.archived}
					className={buttonSecondaryClass(cn("py-1.5", state.archived && "border-primary/60 text-primary"))}
				>
					<LuArchive className="size-4" />
					<span className="max-sm:hidden">Archived</span>
				</button>
				<label className={buttonSecondaryClass("relative py-1.5")}>
					<LuArrowUpDown className="size-4" />
					<span className="max-sm:hidden">{state.sort.label}</span>
					<select
						value={state.sort.value}
						onChange={(e) => update({ sort: e.target.value === SORTS[0].value ? null : e.target.value })}
						className="absolute inset-0 cursor-pointer opacity-0"
						aria-label="Sort projects"
					>
						{SORTS.map((s) => (
							<option key={s.value} value={s.value}>
								{s.label}
							</option>
						))}
					</select>
				</label>
				<Segmented
					className="ml-auto"
					iconOnly
					ariaLabel="View"
					value={state.view}
					onChange={(v) => update({ view: v === "grid" ? null : v })}
					options={[
						{ value: "grid", title: "Grid", icon: <LuLayoutGrid className="size-4" /> },
						{ value: "list", title: "List", icon: <LuList className="size-4" /> },
						{ value: "board", title: "Board", icon: <LuSquareKanban className="size-4" /> },
					]}
				/>
			</div>

			{isBoard ? null : (
				<div className="custom-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
					<StatusChip active={!state.status} label="All" count={counts.ALL} onClick={() => update({ status: null })} />
					{PROJECT_STATUSES.map((s) => (
						<StatusChip
							key={s}
							status={s}
							active={state.status === s}
							label={PROJECT_STATUS_META[s].label}
							count={counts[s]}
							onClick={() => update({ status: s })}
						/>
					))}
				</div>
			)}

			<div className="mt-4">
				{query.isError ? (
					<ErrorState
						title="Could not load projects"
						message={getRequestErrorMessage(query.error, "Something went wrong while loading projects.")}
						onRetry={() => void query.refetch()}
						retrying={query.isRefetching}
					/>
				) : query.isPending ? (
					<GridSkeleton />
				) : projects.length === 0 && !isBoard ? (
					<div className={cardClass}>
						<EmptyState
							icon={<LuFolderSearch />}
							title={filtersActive || state.archived ? "No projects match" : "No projects yet"}
							description={
								state.archived
									? "Archived projects will show up here."
									: filtersActive
										? "Try a different search or status, or turn off Favorites."
										: "Create a project to start tracking its timeline and notes."
							}
							action={
								filtersActive ? (
									<Button variant="secondary" onClick={() => update({ status: null, fav: null, q: null })}>
										Clear filters
									</Button>
								) : state.archived ? null : (
									<Button icon={<LuPlus className="size-4" />} onClick={openCreateProject}>
										New project
									</Button>
								)
							}
						/>
					</div>
				) : isBoard ? (
					<Board projects={projects} canDrag={canDrag} truncated={(query.data?.total_items ?? 0) > projects.length} />
				) : (
					<div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
						{state.view === "list" ? (
							<ProjectTable projects={projects} {...favProps} />
						) : (
							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
								{projects.map((p) => (
									<ProjectCard key={p.id} project={p} {...favProps} />
								))}
								{!state.archived && !filtersActive && !info.canGoNext ? (
									<button
										type="button"
										onClick={openCreateProject}
										className="grid min-h-48 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-sm font-medium text-muted transition hover:border-primary/50 hover:text-primary"
									>
										<span className="flex flex-col items-center gap-2">
											<LuPlus className="size-5" />
											New project
										</span>
									</button>
								) : null}
							</div>
						)}
						<Pagination
							className="mt-5"
							{...info}
							totalItems={query.data?.total_items ?? 0}
							pageLimit={state.limit}
							pageLimitOptions={PAGE_SIZES}
							onPageLimitChange={(n) => update({ limit: n === PAGE_SIZES[0] ? null : String(n) })}
							onFirstPage={() => update({ page: null })}
							onPrevPage={() => update({ page: String(info.current - 1) })}
							onNextPage={() => update({ page: String(info.current + 1) })}
							onLastPage={() => update({ page: String(info.pages) })}
						/>
					</div>
				)}
			</div>
		</Page>
	);
}

/** Search input that updates the URL once typing pauses. */
function SearchBox({ initial, onSearch }: { initial: string; onSearch: (q: string) => void }) {
	const [value, setValue] = useState(initial);
	const debounced = useDebouncedValue(value.trim(), 300);
	const onSearchRef = useRef(onSearch);
	useLayoutEffect(() => {
		onSearchRef.current = onSearch;
	});
	useEffect(() => {
		if (debounced !== initial) onSearchRef.current(debounced);
	}, [debounced, initial]);
	return (
		<div className="relative w-full sm:w-64">
			<LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
			<input
				type="search"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Search projects"
				aria-label="Search projects"
				className={cn(inputClass, "py-1.5 pl-9")}
			/>
		</div>
	);
}

function StatusChip({
	status,
	active,
	label,
	count,
	onClick,
}: {
	status?: ProjectStatus;
	active: boolean;
	label: string;
	count: number | undefined;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
				active ? "border-primary bg-primary text-white" : "border-line bg-surface text-muted hover:text-fg",
			)}
		>
			{status ? (
				<span className={cn("size-1.5 rounded-full", active ? "bg-white" : PROJECT_STATUS_META[status].dot)} />
			) : null}
			{label}
			<span className="tabular-nums opacity-70">{count ?? "·"}</span>
		</button>
	);
}

function ProjectTable({
	projects,
	...fav
}: {
	projects: Project[];
	onToggleFavorite: (id: string) => void;
	favoritePending: boolean;
}) {
	const navigate = useNavigate();
	return (
		<div className={cn(cardClass, "overflow-hidden")}>
			<table className="w-full text-sm">
				<thead className="border-b border-line bg-surface-2/50 text-left text-[11px] tracking-wider text-muted uppercase">
					<tr>
						<th className="px-4 py-2.5 font-medium">Project</th>
						<th className="px-3 py-2.5 font-medium">Status</th>
						<th className="px-3 py-2.5 font-medium max-lg:hidden">Timeline</th>
						<th className="px-3 py-2.5 font-medium max-sm:hidden">Due</th>
						<th className="px-3 py-2.5 font-medium max-md:hidden">Tasks</th>
						<th className="px-3 py-2.5 font-medium max-xl:hidden">Repository</th>
						<th className="w-10">
							<span className="sr-only">Favorite</span>
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-line">
					{projects.map((p) => (
						<tr
							key={p.id}
							onClick={() => navigate(`/projects/${p.id}`)}
							className="cursor-pointer transition-colors hover:bg-surface-2/50"
						>
							<td className="px-4 py-3">
								<div className="flex items-center gap-3">
									<ProjectTile project={p} className="size-7 text-[10px]" />
									<div className="min-w-0">
										<a
											href={`/projects/${p.id}`}
											onClick={(e) => e.preventDefault()}
											className="block truncate font-medium outline-none focus-visible:underline"
										>
											{p.title}
										</a>
										<p className="text-[11px] text-muted">Updated {timeAgo(p.updated_at)}</p>
									</div>
								</div>
							</td>
							<td className="px-3 py-3">
								<ProjectStatusChip status={p.status} />
							</td>
							<td className="w-48 px-3 py-3 max-lg:hidden">
								<TimelineBar project={p} />
								<p className="mt-1 text-[11px] text-muted">
									{formatDay(p.start_date)} → {formatDay(p.end_date)}
								</p>
							</td>
							<td className="px-3 py-3 text-xs max-sm:hidden">
								<DueLabel project={p} />
							</td>
							<td className="px-3 py-3 max-md:hidden">
								{p.task_counts?.total ? <TaskProgressChip project={p} /> : <span className="text-xs text-muted">—</span>}
							</td>
							<td className="px-3 py-3 max-xl:hidden">
								<ProjectRepoBadge repoUrl={p.repo_url} />
							</td>
							<td className="pr-3">
								<FavoriteStar project={p} {...fav} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Board({ projects, canDrag, truncated }: { projects: Project[]; canDrag: boolean; truncated: boolean }) {
	const setStatus = useSetProjectStatus();
	const [over, setOver] = useState<ProjectStatus | null>(null);
	const columns = useMemo(
		() => PROJECT_STATUSES.map((s) => ({ status: s, items: projects.filter((p) => p.status === s) })),
		[projects],
	);

	return (
		<>
			{canDrag ? (
				<p className="mb-3 text-xs text-muted">Drag a card to another column to change its status.</p>
			) : (
				<p className="mb-3 text-xs text-muted">Tap ⇄ on a card to move it to another status.</p>
			)}
			<div className="custom-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
				{columns.map(({ status, items }) => (
					<div
						key={status}
						onDragOver={(e) => {
							if (!canDrag) return;
							e.preventDefault();
							setOver(status);
						}}
						onDragLeave={() => setOver((s) => (s === status ? null : s))}
						onDrop={(e) => {
							e.preventDefault();
							setOver(null);
							const id = e.dataTransfer.getData("text/project-id");
							const project = projects.find((p) => p.id === id);
							if (project && project.status !== status) setStatus.mutate({ id, status });
						}}
						className={cn(
							"w-72 shrink-0 snap-start rounded-xl bg-surface-2/60 p-2 transition",
							over === status && "ring-2 ring-primary/40",
						)}
					>
						<div className="flex items-center gap-2 px-2 py-1.5">
							<span className={cn("size-2 rounded-full", PROJECT_STATUS_META[status].dot)} />
							<span className="text-xs font-semibold">{PROJECT_STATUS_META[status].label}</span>
							<span className="text-xs text-muted">{items.length}</span>
						</div>
						<div className="mt-1 space-y-2">
							{items.length ? (
								items.map((p) => (
									<ProjectBoardCard
										key={p.id}
										project={p}
										draggable={canDrag}
										onMove={(next) => next !== p.status && setStatus.mutate({ id: p.id, status: next })}
									/>
								))
							) : (
								<p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
									{canDrag ? "Drop a project here" : "Nothing here"}
								</p>
							)}
						</div>
					</div>
				))}
			</div>
			{truncated ? (
				<p className="mt-3 text-xs text-muted">The board shows your first {MAX_PAGE_LIMIT * MAX_PAGES} projects.</p>
			) : null}
		</>
	);
}

function GridSkeleton() {
	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{Array.from({ length: 6 }, (_, i) => (
				<div key={i} className={cn(cardClass, "space-y-3 p-4")}>
					<div className="flex items-center gap-3">
						<Skeleton className="size-9 rounded-lg" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-2.5 w-1/3" />
						</div>
					</div>
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-5 w-24 rounded-full" />
					<Skeleton className="h-1.5 w-full rounded-full" />
				</div>
			))}
		</div>
	);
}

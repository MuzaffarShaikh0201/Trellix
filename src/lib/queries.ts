import {
	useMutation,

	useQuery,
	useQueryClient,
	type QueryClient,
} from "@tanstack/react-query";

import { fetchNotes } from "@/lib/api/notes";
import type { GetNotesResponse } from "@/types/note";
import {
	deleteProject,
	fetchProjectCounts,
	fetchProject,
	fetchProjects,
	fetchRecentProjects,
	toggleProjectArchived,
	toggleProjectFavorite,
	updateProject,
} from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { PROJECT_STATUSES } from "@/lib/project/projectStatusStyles";
import { showAlert } from "@/services/alertService";
import type {
	GetProjectsParams,
	GetProjectsResponse,
	Project,
	ProjectStatus,
	UpdateProjectParams,
} from "@/types/project";

/** Every project list lives under ["projects", ...]; a single project under ["project", id]. */
export const projectKeys = {
	all: ["projects"] as const,
	list: (params: GetProjectsParams) => ["projects", "list", params] as const,
	recent: ["projects", "recent"] as const,
	/** Up to 100 active projects, by title. Used for pickers, search, calendar, colors. */
	everything: ["projects", "everything"] as const,
	favorites: ["projects", "favorites"] as const,
	count: (params: GetProjectsParams) => ["projects", "count", params] as const,
	detail: (id: string) => ["project", id] as const,
};

export const noteKeys = {
	all: ["notes"] as const,
	detail: (id: string) => ["note", id] as const,
};

/** The API caps `limit` at 100. */
export const MAX_PAGE_LIMIT = 100;
/** Safety cap for "load everything" queries: 10 pages × 100 = 1,000 items. */
export const MAX_PAGES = 10;

type Paged = { total_pages: number; total_items: number; current_page: number; items_per_page: number };

/**
 * Loads every page (100 at a time, up to MAX_PAGES) and merges the given list field.
 * Returns the same shape as a single page so callers don't care.
 */
export async function fetchAllPages<R extends Paged>(
	fetchPage: (page: number) => Promise<R>,
	listKey: keyof NoInfer<R>,
): Promise<R & { truncated: boolean }> {
	const first = await fetchPage(1);
	const pages = Math.min(first.total_pages, MAX_PAGES);
	const rest = await Promise.all(
		Array.from({ length: Math.max(0, pages - 1) }, (_, i) => fetchPage(i + 2)),
	);
	const merged = [first, ...rest].flatMap((p) => p[listKey] as unknown[]);
	return { ...first, [listKey]: merged, truncated: first.total_pages > MAX_PAGES };
}

/** All active projects (up to 1,000), by title. Used by pickers, search, calendar and colors. */
export function useAllProjects() {
	return useQuery({
		queryKey: projectKeys.everything,
		queryFn: () =>
			fetchAllPages<GetProjectsResponse>(
				(page) =>
					fetchProjects({
						page,
						limit: MAX_PAGE_LIMIT,
						sort_by: "title",
						sort_order: "asc",
						is_archived: false,
					}),
				"projects",
			),
		staleTime: 30_000,
	});
}

/** All notes (up to 1,000), most recently updated first, pinned on top. Used by search and the dashboard. */
export function useAllNotes() {
	return useQuery({
		queryKey: [...noteKeys.all, "everything"],
		queryFn: () =>
			fetchAllPages<GetNotesResponse>(
				(page) => fetchNotes({ page, limit: MAX_PAGE_LIMIT, sort_by: "updated_at", sort_order: "desc" }),
				"notes",
			),
		staleTime: 30_000,
	});
}

export function useFavoriteProjects() {
	return useQuery({
		queryKey: projectKeys.favorites,
		queryFn: () =>
			fetchProjects({ is_favorite: true, limit: 20, sort_by: "title", sort_order: "asc" }),
		staleTime: 30_000,
	});
}

export function useRecentProjects() {
	return useQuery({ queryKey: projectKeys.recent, queryFn: fetchRecentProjects });
}

export function useProject(id: string | undefined) {
	return useQuery({
		queryKey: projectKeys.detail(id ?? ""),
		queryFn: () => fetchProject(id!),
		enabled: Boolean(id),
	});
}

/** Per-status totals from GET /project/counts (archived excluded unless asked for). */
export function useProjectStatusCounts(filters: Pick<GetProjectsParams, "is_archived" | "is_favorite"> = {}) {
	const { data, isPending } = useQuery({
		queryKey: projectKeys.count(filters),
		queryFn: () => fetchProjectCounts(filters),
		staleTime: 30_000,
	});
	const counts = {} as Record<ProjectStatus | "ALL", number | undefined>;
	counts.ALL = data?.total;
	for (const s of PROJECT_STATUSES) counts[s] = data?.by_status[s];
	return { counts, isPending };
}

type ProjectLike = { id: string; is_favorite?: boolean; status?: ProjectStatus };

/** Applies a change to a project in every cached list and in its detail query. */
function patchProjectEverywhere(
	qc: QueryClient,
	id: string,
	patch: (p: ProjectLike) => ProjectLike,
) {
	qc.setQueriesData<{ projects?: ProjectLike[] }>({ queryKey: projectKeys.all }, (data) =>
		data?.projects
			? { ...data, projects: data.projects.map((p) => (p.id === id ? patch(p) : p)) }
			: data,
	);
	qc.setQueryData<Project>(projectKeys.detail(id), (p) => (p ? (patch(p) as Project) : p));
}

async function snapshot(qc: QueryClient, id: string) {
	await qc.cancelQueries({ queryKey: projectKeys.all });
	await qc.cancelQueries({ queryKey: projectKeys.detail(id) });
	return [
		...qc.getQueriesData({ queryKey: projectKeys.all }),
		...qc.getQueriesData({ queryKey: projectKeys.detail(id) }),
	];
}

function restore(qc: QueryClient, saved: Awaited<ReturnType<typeof snapshot>> | undefined) {
	saved?.forEach(([key, data]) => qc.setQueryData(key, data));
}

async function refreshProject(qc: QueryClient, id: string) {
	await Promise.all([
		qc.invalidateQueries({ queryKey: projectKeys.all }),
		qc.invalidateQueries({ queryKey: projectKeys.detail(id) }),
	]);
}

function failed(title: string, fallback: string) {
	return (err: unknown) => showAlert(title, "error", getRequestErrorMessage(err, fallback));
}

export function useToggleFavorite() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => toggleProjectFavorite(id),
		onMutate: async (id) => {
			const saved = await snapshot(qc, id);
			patchProjectEverywhere(qc, id, (p) => ({ ...p, is_favorite: !p.is_favorite }));
			return { saved };
		},
		onError: (err, _id, ctx) => {
			restore(qc, ctx?.saved);
			failed("Could not update favorite", "Something went wrong while updating favorite status.")(err);
		},
		onSettled: (_d, _e, id) => refreshProject(qc, id),
	});
}

export function useSetProjectStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
			updateProject(id, { status }),
		onMutate: async ({ id, status }) => {
			const saved = await snapshot(qc, id);
			patchProjectEverywhere(qc, id, (p) => ({ ...p, status }));
			return { saved };
		},
		onError: (err, _v, ctx) => {
			restore(qc, ctx?.saved);
			failed("Could not change status", "Something went wrong while updating the status.")(err);
		},
		onSettled: (_d, _e, { id }) => refreshProject(qc, id),
	});
}

/** Saves a partial project update with an optimistic change to the detail view. */
export function useUpdateProject(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateProjectParams) => updateProject(id, payload),
		onMutate: async (payload) => {
			const saved = await snapshot(qc, id);
			qc.setQueryData<Project>(projectKeys.detail(id), (p) =>
				p ? ({ ...p, ...payload } as Project) : p,
			);
			return { saved };
		},
		onError: (err, _v, ctx) => {
			restore(qc, ctx?.saved);
			failed("Could not save", "Something went wrong while saving this project.")(err);
		},
		onSettled: () => refreshProject(qc, id),
	});
}

export function useToggleArchive() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (project: Pick<Project, "id" | "is_archived">) => toggleProjectArchived(project.id),
		onSuccess: (_d, project) =>
			showAlert(
				project.is_archived ? "Project restored" : "Project archived",
				"success",
				project.is_archived
					? "It's back in your active projects."
					: "You can find it under Archived on the Projects page.",
			),
		onError: failed("Action failed", "Something went wrong while updating archive status."),
		onSettled: (_d, _e, project) => refreshProject(qc, project.id),
	});
}

export function useDeleteProject() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteProject(id),
		onSuccess: async (_d, id) => {
			showAlert("Project deleted", "success", "The project has been removed.");
			qc.removeQueries({ queryKey: projectKeys.detail(id) });
			await Promise.all([
				qc.invalidateQueries({ queryKey: projectKeys.all }),
				qc.invalidateQueries({ queryKey: noteKeys.all }),
			]);
		},
		onError: failed("Delete failed", "Something went wrong while deleting this project."),
	});
}

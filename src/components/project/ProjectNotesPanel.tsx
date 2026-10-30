import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { LuPlus } from "react-icons/lu";

import { NoteCard } from "@/components/note/NoteCard";
import { ErrorState, Skeleton } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { pageInfo } from "@/lib/pagination";
import { fetchNotes } from "@/lib/api/notes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { noteKeys } from "@/lib/queries";
import { useTogglePin } from "@/lib/noteQueries";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

const LIMIT = 12;

export function ProjectNotesPanel({ project }: { project: Project }) {
	const [page, setPage] = useState(1);
	const params = { project_id: project.id, page, limit: LIMIT, sort_by: "updated_at" as const, sort_order: "desc" as const };
	const query = useQuery({
		queryKey: [...noteKeys.all, "list", params],
		queryFn: () => fetchNotes(params),
		placeholderData: keepPreviousData,
	});
	const pin = useTogglePin();

	if (query.isError) {
		return (
			<ErrorState
				title="Could not load notes"
				message={getRequestErrorMessage(query.error, "Something went wrong while loading notes.")}
				onRetry={() => void query.refetch()}
				retrying={query.isRefetching}
			/>
		);
	}

	const notes = query.data?.notes ?? [];
	const info = pageInfo(page, LIMIT, query.data?.total_items ?? 0, query.data?.total_pages ?? 1);
	const newNoteHref = `/notes/new?projectId=${encodeURIComponent(project.id)}`;

	return (
		<div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{query.isPending
					? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
					: notes.map((n) => (
							<NoteCard
								key={n.id}
								note={n}
								showProjectBadge={false}
								onTogglePinned={(id) => pin.mutate(id)}
								pinPending={pin.isPending && pin.variables === n.id}
							/>
						))}
				{!query.isPending && !info.canGoNext ? (
					<Link
						to={newNoteHref}
						state={{ lockedProjectTitle: project.title }}
						className="grid min-h-36 place-items-center rounded-xl border-2 border-dashed border-line px-4 text-center text-sm font-medium text-muted transition hover:border-primary/50 hover:text-primary"
					>
						<span className="flex flex-col items-center gap-2">
							<LuPlus className="size-5" />
							{notes.length ? "New note" : `Write the first note for ${project.title}`}
						</span>
					</Link>
				) : null}
			</div>
			<Pagination
				className="mt-5"
				{...info}
				totalItems={query.data?.total_items ?? 0}
				onFirstPage={() => setPage(1)}
				onPrevPage={() => setPage(info.current - 1)}
				onNextPage={() => setPage(info.current + 1)}
				onLastPage={() => setPage(info.pages)}
			/>
		</div>
	);
}

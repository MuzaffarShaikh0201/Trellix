import { useMemo, useState } from "react";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import {
	LuLayoutGrid,
	LuNotebookPen,
	LuPanelsTopLeft,
	LuPencil,
	LuPin,
	LuPlus,
	LuSearch,
} from "react-icons/lu";

import { Page, PageHeader } from "@/components/layout/AppShell";
import { TopbarActions } from "@/components/layout/TopbarActions";
import { MarkdownContent } from "@/components/note/MarkdownContent";
import { NoteCard } from "@/components/note/NoteCard";
import { NoteProjectBadge } from "@/components/note/NoteProjectBadge";
import Button from "@/components/ui/Button";
import { buttonPrimaryClass, buttonSecondaryClass, iconButtonClass } from "@/components/ui/buttonStyles";
import { EmptyState, ErrorState, Skeleton, cardClass } from "@/components/ui/Card";
import { SelectField } from "@/components/ui/Field";
import { inputClass } from "@/components/ui/fieldStyles";
import { Segmented } from "@/components/ui/Segmented";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fetchNote, fetchNotes } from "@/lib/api/notes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { getNoteDisplayTitle, notePreview } from "@/lib/note/noteDisplay";
import { useTogglePin } from "@/lib/noteQueries";
import { timeAgo } from "@/lib/project/projectDisplay";
import { noteKeys, useAllProjects } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { GetNotesParams, NoteListItem } from "@/types/note";

type Layout = "split" | "grid";
const LAYOUT_KEY = "trellix-notes-layout";
const PAGE = 30;

function readLayout(): Layout {
	try {
		return localStorage.getItem(LAYOUT_KEY) === "grid" ? "grid" : "split";
	} catch {
		return "split";
	}
}

export function NotesPage() {
	const [sp, setSp] = useSearchParams();
	const personal = sp.get("tab") === "personal";
	const projectFilter = personal ? "" : (sp.get("project") ?? "");
	const selectedId = sp.get("note");
	const [filter, setFilter] = useState("");
	const [layout, setLayoutState] = useState<Layout>(readLayout);
	const wide = useMediaQuery("(min-width: 1024px)");
	const split = wide && layout === "split";

	function setLayout(next: Layout) {
		setLayoutState(next);
		try {
			localStorage.setItem(LAYOUT_KEY, next);
		} catch {
			/* storage unavailable */
		}
	}

	function setParam(patch: Record<string, string | null>) {
		setSp(
			(prev) => {
				const next = new URLSearchParams(prev);
				for (const [k, v] of Object.entries(patch)) {
					if (v) next.set(k, v);
					else next.delete(k);
				}
				return next;
			},
			{ replace: true },
		);
	}

	const projects = useAllProjects();
	const colorById = useMemo(
		() => new Map((projects.data?.projects ?? []).map((p) => [p.id, p.color])),
		[projects.data],
	);

	// Search runs on the server (title + content) once typing pauses.
	const search = useDebouncedValue(filter.trim(), 250);
	const params: GetNotesParams = {
		q: search || undefined,
		personal: personal || undefined,
		project_id: projectFilter || undefined,
		limit: PAGE,
		sort_by: "updated_at",
		sort_order: "desc",
	};
	const query = useInfiniteQuery({
		queryKey: [...noteKeys.all, "infinite", params],
		queryFn: ({ pageParam }) => fetchNotes({ ...params, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.current_page < last.total_pages ? last.current_page + 1 : undefined),
		placeholderData: keepPreviousData,
	});
	const pin = useTogglePin();

	const all = useMemo(() => query.data?.pages.flatMap((p) => p.notes) ?? [], [query.data]);
	const total = query.data?.pages[0]?.total_items ?? 0;
	const visible = all;
	const activeId = selectedId && all.some((n) => n.id === selectedId) ? selectedId : all[0]?.id;

	const projectOptions = [
		{ value: "", label: "All projects" },
		...(projects.data?.projects ?? []).map((p) => ({ value: p.id, label: p.title })),
	];

	const controls = (
		<>
			<Segmented
				ariaLabel="Which notes"
				value={personal ? "personal" : "all"}
				onChange={(v) => setParam({ tab: v === "personal" ? "personal" : null, project: null, note: null })}
				options={[
					{ value: "all", label: "All" },
					{ value: "personal", label: "Personal" },
				]}
			/>
			<SelectField
				aria-label="Filter by project"
				value={projectFilter}
				disabled={personal}
				onChange={(v) => setParam({ project: v || null, note: null })}
				options={projectOptions}
				selectClassName="py-1.5 text-xs"
			/>
		</>
	);

	const layoutToggle = (
		<Segmented
			iconOnly
			ariaLabel="Layout"
			value={layout}
			onChange={setLayout}
			className="max-lg:hidden"
			options={[
				{ value: "split", title: "Two panes", icon: <LuPanelsTopLeft className="size-4" /> },
				{ value: "grid", title: "Grid", icon: <LuLayoutGrid className="size-4" /> },
			]}
		/>
	);

	const loadMore = query.hasNextPage ? (
		<div className="flex justify-center p-3">
			<Button variant="ghost" onClick={() => void query.fetchNextPage()} loading={query.isFetchingNextPage}>
				Load more
			</Button>
		</div>
	) : null;

	const errorBox = query.isError ? (
		<ErrorState
			className="m-3"
			title="Could not load notes"
			message={getRequestErrorMessage(query.error, "Something went wrong while loading notes.")}
			onRetry={() => void query.refetch()}
			retrying={query.isRefetching}
		/>
	) : null;

	const empty = (
		<EmptyState
			icon={<LuNotebookPen />}
			title={filter ? "No matching notes" : "No notes here yet"}
			description={
				filter
					? "Try a different word or another project."
					: "Capture meeting notes, specs and ideas in Markdown."
			}
			action={
				filter ? null : (
					<Link to="/notes/new" className={buttonPrimaryClass()}>
						<LuPlus className="size-4" />
						New note
					</Link>
				)
			}
		/>
	);

	if (!split) {
		const groups = [
			{ title: "Pinned", items: visible.filter((n) => n.is_pinned) },
			{ title: "Notes", items: visible.filter((n) => !n.is_pinned) },
		];
		return (
			<Page>
				<TopbarActions>{layoutToggle}</TopbarActions>
				<PageHeader
					title="Notes"
					subtitle={query.isPending ? "Loading…" : `${total} notes`}
					actions={
						<Link to="/notes/new" className={buttonPrimaryClass()}>
							<LuPlus className="size-4" />
							New note
						</Link>
					}
				/>
				<div className="mt-5 grid gap-2 sm:flex sm:items-center">
					<FilterInput value={filter} onChange={setFilter} className="sm:w-64" />
					<div className="flex gap-2 [&>*:last-child]:flex-1 sm:[&>*:last-child]:w-52 sm:[&>*:last-child]:flex-none">
						{controls}
					</div>
				</div>
				{errorBox}
				{query.isPending ? (
					<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 6 }, (_, i) => (
							<Skeleton key={i} className="h-36 rounded-xl" />
						))}
					</div>
				) : visible.length === 0 ? (
					<div className={cn(cardClass, "mt-6")}>{empty}</div>
				) : (
					groups.map((g) =>
						g.items.length ? (
							<section key={g.title}>
								<p className="mt-6 mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">{g.title}</p>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{g.items.map((n) => (
										<NoteCard
											key={n.id}
											note={n}
											projectColor={n.project ? colorById.get(n.project.id) : undefined}
											onTogglePinned={(id) => pin.mutate(id)}
											pinPending={pin.isPending && pin.variables === n.id}
										/>
									))}
								</div>
							</section>
						) : null,
					)
				)}
				{loadMore}
			</Page>
		);
	}

	return (
		<div className="flex min-h-0 flex-1">
			<TopbarActions>{layoutToggle}</TopbarActions>
			<div className="flex w-80 shrink-0 flex-col border-r border-line bg-surface">
				<div className="space-y-2 border-b border-line p-3">
					<div className="flex items-center gap-2">
						<FilterInput value={filter} onChange={setFilter} className="flex-1" />
						<Link to="/notes/new" className={buttonPrimaryClass("size-8 p-0")} aria-label="New note" title="New note">
							<LuPlus className="size-4" />
						</Link>
					</div>
					{controls}
				</div>
				<div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-3">
					{errorBox}
					{query.isPending ? (
						<div className="space-y-4 p-4">
							{Array.from({ length: 5 }, (_, i) => (
								<div key={i} className="space-y-1.5">
									<Skeleton className="h-3.5 w-2/3" />
									<Skeleton className="h-3 w-full" />
								</div>
							))}
						</div>
					) : visible.length === 0 ? (
						empty
					) : (
						<>
							<NoteList title="Pinned" notes={visible.filter((n) => n.is_pinned)} activeId={activeId} colorById={colorById} />
							<NoteList title="Notes" notes={visible.filter((n) => !n.is_pinned)} activeId={activeId} colorById={colorById} />
							{loadMore}
						</>
					)}
				</div>
			</div>
			<div className="custom-scrollbar min-w-0 flex-1 overflow-y-auto">
				{activeId ? (
					<NoteReader
						id={activeId}
						color={colorById}
						onTogglePin={(id) => pin.mutate(id)}
					/>
				) : query.isPending ? null : (
					<div className="grid h-full place-items-center text-sm text-muted">Select a note to read it.</div>
				)}
			</div>
		</div>
	);
}

function FilterInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
	return (
		<div className={cn("relative", className)}>
			<LuSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search notes"
				aria-label="Search notes"
				className={cn(inputClass, "py-1.5 pl-8 text-xs")}
			/>
		</div>
	);
}

function NoteList({
	title,
	notes,
	activeId,
	colorById,
}: {
	title: string;
	notes: NoteListItem[];
	activeId: string | undefined;
	colorById: Map<string, string | null>;
}) {
	const [sp] = useSearchParams();
	if (!notes.length) return null;
	return (
		<>
			<p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase">{title}</p>
			{notes.map((n) => {
				const next = new URLSearchParams(sp);
				next.set("note", n.id);
				const active = n.id === activeId;
				return (
					<Link
						key={n.id}
						to={`/notes?${next.toString()}`}
						replace
						aria-current={active ? "true" : undefined}
						className={cn(
							"mx-1.5 block rounded-lg px-2.5 py-2.5 transition-colors",
							active ? "bg-primary/10" : "hover:bg-surface-2",
						)}
					>
						<div className="flex items-center gap-2">
							<p className={cn("flex-1 truncate text-sm font-medium", active && "text-primary")}>
								{getNoteDisplayTitle(n)}
							</p>
							<span className="shrink-0 text-[10px] text-muted">{timeAgo(n.updated_at)}</span>
						</div>
						{notePreview(n) ? (
							<p className="mt-0.5 truncate text-xs text-muted">{notePreview(n)}</p>
						) : null}
						<NoteProjectBadge
							className="mt-1.5"
							project={n.project}
							color={n.project ? colorById.get(n.project.id) : undefined}
						/>
					</Link>
				);
			})}
		</>
	);
}

function NoteReader({
	id,
	color,
	onTogglePin,
}: {
	id: string;
	color: Map<string, string | null>;
	onTogglePin: (id: string) => void;
}) {
	const { data: note, isPending, isError, error, refetch } = useQuery({
		queryKey: noteKeys.detail(id),
		queryFn: () => fetchNote(id),
	});

	if (isError) {
		return (
			<ErrorState
				className="m-8"
				title="Could not load this note"
				message={getRequestErrorMessage(error, "Please try again.")}
				onRetry={() => void refetch()}
			/>
		);
	}
	if (isPending || !note) {
		return (
			<div className="mx-auto max-w-3xl space-y-3 px-8 py-10">
				<Skeleton className="h-7 w-1/2" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
			</div>
		);
	}

	return (
		<article>
			<div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-bg/85 px-8 py-2.5 backdrop-blur">
				<NoteProjectBadge project={note.project} color={note.project ? color.get(note.project.id) : undefined} />
				<span className="text-xs text-muted">Edited {timeAgo(note.updated_at)}</span>
				<div className="ml-auto flex items-center gap-1">
					<button
						type="button"
						onClick={() => onTogglePin(note.id)}
						aria-pressed={note.is_pinned}
						aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
						className={iconButtonClass(cn("size-8", note.is_pinned && "text-primary"))}
					>
						<LuPin className={cn("size-4", note.is_pinned && "fill-current")} />
					</button>
					<Link to={`/notes/${note.id}`} className={buttonSecondaryClass("py-1.5")}>
						<LuPencil className="size-3.5" />
						Edit
					</Link>
				</div>
			</div>
			<div className="mx-auto max-w-3xl px-8 py-8">
				{/^#\s/.test(note.content?.trimStart() ?? "") ? null : (
					<h1 className="mb-4 text-2xl font-semibold tracking-tight">{getNoteDisplayTitle(note)}</h1>
				)}
				{note.content?.trim() ? (
					<MarkdownContent content={note.content} className="text-[15px]" />
				) : (
					<p className="text-sm text-muted">
						This note is empty.{" "}
						<Link to={`/notes/${note.id}`} className="text-primary hover:underline">
							Start writing
						</Link>
					</p>
				)}
			</div>
		</article>
	);
}

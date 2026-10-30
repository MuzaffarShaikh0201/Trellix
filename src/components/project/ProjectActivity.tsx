import type { ReactNode } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
	LuArchive,
	LuArchiveRestore,
	LuCircleCheck,
	LuFilePen,
	LuFilePlus,
	LuFileX,
	LuFolderPlus,
	LuHistory,
	LuListPlus,
	LuPencil,
	LuTrash2,
} from "react-icons/lu";

import Button from "@/components/ui/Button";
import { Card, EmptyState, ErrorState, Skeleton } from "@/components/ui/Card";
import { fetchProjectActivity } from "@/lib/api/activity";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { formatDay, timeAgo } from "@/lib/project/projectDisplay";
import { PROJECT_STATUS_META } from "@/lib/project/projectStatusStyles";
import { cn } from "@/lib/utils";
import type { ActivityChange, ActivityItem } from "@/types/activity";
import type { ProjectStatus } from "@/types/project";

const PAGE = 20;

const FIELD_LABELS: Record<string, string> = {
	title: "Title",
	description: "Description",
	status: "Status",
	start_date: "Start date",
	end_date: "End date",
	repo_url: "Repository",
	color: "Color",
};

function formatValue(field: string, value: unknown): ReactNode {
	if (value === null || value === undefined || value === "") return <span className="italic">none</span>;
	if (field === "status" && typeof value === "string" && value in PROJECT_STATUS_META) {
		return PROJECT_STATUS_META[value as ProjectStatus].label;
	}
	if ((field === "start_date" || field === "end_date") && typeof value === "string") return formatDay(value, true);
	if (field === "color" && typeof value === "string") {
		return (
			<span className="inline-flex items-center gap-1 align-middle">
				<span className="inline-block size-3 rounded-full" style={{ background: value }} />
				{value}
			</span>
		);
	}
	return String(value);
}

function Change({ change }: { change: ActivityChange }) {
	const label = FIELD_LABELS[change.field] ?? change.field;
	// Long text fields just say they changed.
	if (change.field === "description") {
		return <li>{change.to ? "Updated the description" : "Removed the description"}</li>;
	}
	return (
		<li>
			<span className="text-muted">{label}:</span> <span className="line-through opacity-60">{formatValue(change.field, change.from)}</span>{" "}
			→ <span className="font-medium">{formatValue(change.field, change.to)}</span>
		</li>
	);
}

function describe(e: ActivityItem): { icon: ReactNode; tone: string; text: ReactNode; detail?: ReactNode } {
	const noteLink = (id: string, title: string) => (
		<Link to={`/notes/${id}`} className="font-medium hover:text-primary hover:underline">
			{title || "Untitled note"}
		</Link>
	);
	switch (e.type) {
		case "project.created":
			return { icon: <LuFolderPlus />, tone: "text-primary", text: "Project created" };
		case "project.updated": {
			const changes = e.data.changes ?? [];
			return {
				icon: <LuPencil />,
				tone: "text-muted",
				text: changes.length === 1 ? "Updated 1 field" : `Updated ${changes.length} fields`,
				detail: (
					<ul className="mt-1.5 space-y-0.5 text-xs">
						{changes.map((c) => (
							<Change key={c.field} change={c} />
						))}
					</ul>
				),
			};
		}
		case "project.archived":
			return { icon: <LuArchive />, tone: "text-muted", text: "Project archived" };
		case "project.restored":
			return { icon: <LuArchiveRestore />, tone: "text-primary", text: "Project restored from archive" };
		case "note.created":
			return { icon: <LuFilePlus />, tone: "text-emerald-600 dark:text-emerald-400", text: <>Note {noteLink(e.data.note_id, e.data.title)} created</> };
		case "note.updated":
			return { icon: <LuFilePen />, tone: "text-muted", text: <>Note {noteLink(e.data.note_id, e.data.title)} edited</> };
		case "note.deleted":
			return { icon: <LuFileX />, tone: "text-red-600 dark:text-red-400", text: <>Note <span className="font-medium">{e.data.title || "Untitled note"}</span> deleted</> };
		case "task.created":
			return { icon: <LuListPlus />, tone: "text-primary", text: <>Task <span className="font-medium">{e.data.title}</span> added</> };
		case "task.completed":
			return { icon: <LuCircleCheck />, tone: "text-emerald-600 dark:text-emerald-400", text: <>Task <span className="font-medium">{e.data.title}</span> completed</> };
		case "task.deleted":
			return { icon: <LuTrash2 />, tone: "text-red-600 dark:text-red-400", text: <>Task <span className="font-medium">{e.data.title}</span> deleted</> };
		default:
			return { icon: <LuHistory />, tone: "text-muted", text: (e as { type: string }).type };
	}
}

export function ProjectActivity({ projectId }: { projectId: string }) {
	const query = useInfiniteQuery({
		queryKey: ["activity", projectId],
		queryFn: ({ pageParam }) => fetchProjectActivity(projectId, { page: pageParam, limit: PAGE }),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.current_page < last.total_pages ? last.current_page + 1 : undefined),
	});

	if (query.isError) {
		return (
			<ErrorState
				title="Could not load the timeline"
				message={getRequestErrorMessage(query.error, "Something went wrong while loading activity.")}
				onRetry={() => void query.refetch()}
				retrying={query.isRefetching}
			/>
		);
	}
	if (query.isPending) {
		return (
			<Card className="space-y-5 p-5">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="flex gap-3">
						<Skeleton className="size-7 rounded-full" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-3.5 w-1/2" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				))}
			</Card>
		);
	}

	const events = query.data.pages.flatMap((p) => p.events);
	if (!events.length) {
		return (
			<Card>
				<EmptyState icon={<LuHistory />} title="No activity yet" description="Changes to this project, its notes and its tasks will show up here." />
			</Card>
		);
	}

	return (
		<Card className="p-5">
			<ol className="relative space-y-5 border-l border-line pl-6">
				{events.map((e) => {
					const { icon, tone, text, detail } = describe(e);
					return (
						<li key={e.id} className="relative">
							<span
								aria-hidden
								className={cn(
									"absolute top-0 -left-[37px] grid size-6 place-items-center rounded-full border border-line bg-surface [&>svg]:size-3",
									tone,
								)}
							>
								{icon}
							</span>
							<p className="text-sm">{text}</p>
							{detail}
							<time dateTime={e.created_at} title={new Date(e.created_at).toLocaleString()} className="mt-0.5 block text-[11px] text-muted">
								{timeAgo(e.created_at)}
							</time>
						</li>
					);
				})}
			</ol>
			{query.hasNextPage ? (
				<div className="mt-5 flex justify-center">
					<Button variant="ghost" onClick={() => void query.fetchNextPage()} loading={query.isFetchingNextPage}>
						Show older activity
					</Button>
				</div>
			) : null}
		</Card>
	);
}

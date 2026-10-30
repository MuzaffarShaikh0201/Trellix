import { Link } from "react-router";
import { LuPin } from "react-icons/lu";

import { NoteProjectBadge } from "@/components/note/NoteProjectBadge";
import { cardClass } from "@/components/ui/Card";
import { getNoteDisplayTitle, notePreview } from "@/lib/note/noteDisplay";
import { timeAgo } from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "@/types/note";

type NoteCardProps = {
	note: NoteListItem;
	projectColor?: string | null;
	showProjectBadge?: boolean;
	onTogglePinned: (noteId: string) => void;
	pinPending: boolean;
};

export function NoteCard({
	note,
	projectColor,
	showProjectBadge = true,
	onTogglePinned,
	pinPending,
}: NoteCardProps) {
	const snippet = notePreview(note);
	return (
		<Link
			to={`/notes/${note.id}`}
			className={cn(
				cardClass,
				"group flex min-h-28 min-w-0 flex-col p-4 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
			)}
		>
			<div className="flex items-start gap-2">
				<h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{getNoteDisplayTitle(note)}</h3>
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onTogglePinned(note.id);
					}}
					disabled={pinPending}
					aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
					aria-pressed={note.is_pinned}
					className={cn(
						"-m-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md transition",
						note.is_pinned
							? "text-primary"
							: "text-muted opacity-100 hover:text-fg md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
					)}
				>
					<LuPin className={cn("size-3.5", note.is_pinned && "fill-current")} />
				</button>
			</div>
			{snippet ? (
				<p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted">{snippet}</p>
			) : null}
			<div className="flex-1" />
			<div className="mt-3 flex items-center justify-between gap-2">
				{showProjectBadge ? <NoteProjectBadge project={note.project} color={projectColor} /> : <span />}
				<span className="shrink-0 text-[11px] text-muted">{timeAgo(note.updated_at)}</span>
			</div>
		</Link>
	);
}

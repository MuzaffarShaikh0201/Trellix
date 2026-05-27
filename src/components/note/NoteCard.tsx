import { useNavigate } from "react-router";
import { MdPushPin } from "react-icons/md";

import { NoteProjectBadge } from "@/components/note/NoteProjectBadge";
import { noteCardShellClass } from "@/components/note/note-card-shell";
import { NoteLastUpdated } from "@/components/note/NoteLastUpdated";
import { getNoteDisplayTitle } from "@/lib/note/noteDisplay";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "@/types/note";

const NOTE_TITLE_MAX_CHARS = 48;

function truncateText(value: string, maxChars: number) {
	const normalized = value.replace(/\s+/g, " ").trim();
	if (normalized.length <= maxChars) return normalized;
	return `${normalized.slice(0, maxChars).trimEnd()}…`;
}

export function NoteCard({
	note,
	projectColor,
	showProjectBadge = true,
	onTogglePinned,
	pinPending,
}: {
	note: NoteListItem;
	projectColor?: string | null;
	showProjectBadge?: boolean;
	onTogglePinned: (noteId: string) => void;
	pinPending: boolean;
}) {
	const navigate = useNavigate();
	const displayTitle = getNoteDisplayTitle(note);

	function openNote() {
		navigate(`/notes/${note.id}`);
	}

	return (
		<article
			role="link"
			tabIndex={0}
			aria-label={`Open note ${displayTitle}`}
			onClick={openNote}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					openNote();
				}
			}}
			className={cn("group cursor-pointer self-start", noteCardShellClass)}
		>
			<div className="flex flex-col p-4">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3
							className="line-clamp-2 text-base font-semibold leading-snug text-text-primary"
							title={displayTitle}
						>
							{truncateText(displayTitle, NOTE_TITLE_MAX_CHARS)}
						</h3>
						{showProjectBadge ? (
							<NoteProjectBadge
								note={note}
								projectColor={projectColor}
								className="mt-1.5"
							/>
						) : null}
					</div>
					<div className="flex shrink-0 items-center gap-0.5">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onTogglePinned(note.id);
							}}
							disabled={pinPending}
							className={cn(
								"rounded-md p-1 text-text-secondary transition-colors hover:text-primary",
								note.is_pinned && "text-primary",
								pinPending && "cursor-wait opacity-60",
							)}
							aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
						>
							<MdPushPin
								className={cn(
									"h-[18px] w-[18px]",
									note.is_pinned && "rotate-45",
								)}
								aria-hidden
							/>
						</button>
					</div>
				</div>

				<NoteLastUpdated updatedAt={note.updated_at} className="mt-4" />
			</div>
		</article>
	);
}

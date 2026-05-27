import { Link } from "react-router";
import { MdFolder } from "react-icons/md";

import { getNoteProjectLabel } from "@/lib/note/noteDisplay";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "@/types/note";

const noteProjectChipClass = cn(
	"inline-flex w-fit max-w-[70%] min-w-0 items-center gap-1.5 overflow-hidden rounded px-2.5 py-1",
	"bg-tint text-xs font-medium text-text-primary",
);

type NoteProjectBadgeProps = {
	note: NoteListItem;
	/** Project accent color from GET /project (when available). */
	projectColor?: string | null;
	className?: string;
};

export function NoteProjectBadge({
	note,
	projectColor,
	className,
}: NoteProjectBadgeProps) {
	const label = getNoteProjectLabel(note);
	const hasProject = Boolean(note.project);
	const accent = projectColor?.trim();

	const content = (
		<>
			<MdFolder
				className={cn(
					"size-4 shrink-0",
					!hasProject && "text-text-secondary",
					hasProject && !accent && "text-primary",
				)}
				style={hasProject && accent ? { color: accent } : undefined}
				aria-hidden
			/>
			<span className="min-w-0 truncate">{label}</span>
		</>
	);

	if (hasProject && note.project) {
		return (
			<Link
				to={`/projects/${note.project.id}`}
				onClick={(e) => e.stopPropagation()}
				className={cn(
					noteProjectChipClass,
					"cursor-pointer transition-opacity hover:opacity-90",
					className,
				)}
				title={label}
				aria-label={`Open project ${label}`}
			>
				{content}
			</Link>
		);
	}

	return (
		<span
			className={cn(noteProjectChipClass, className)}
			title="No project"
			aria-label="No project"
		>
			{content}
		</span>
	);
}

import type { NoteListItem } from "@/types/note";

export function getNoteDisplayTitle(note: NoteListItem): string {
	const title = note.title?.trim();
	if (title) return title;
	return "Untitled note";
}

export function getNoteProjectLabel(note: NoteListItem): string {
	if (!note.project) return "--";
	return note.project.title?.trim() || "--";
}

import type { NoteListItem } from "@/types/note";

export function getNoteDisplayTitle(note: Pick<NoteListItem, "title">): string {
	return note.title?.trim() || "Untitled note";
}

/** Plain-text preview of a markdown note. */
export function noteSnippet(content: string | null | undefined, max = 140): string {
	if (!content) return "";
	return content
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "")
		.replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
		.replace(/[*_`~|]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, max);
}

export function wordCount(content: string): number {
	return content.split(/\s+/).filter(Boolean).length;
}

/** Preview text for list views: the server's excerpt, or one built from content when present. */
export function notePreview(note: Pick<NoteListItem, "excerpt" | "content">): string {
	return note.excerpt?.trim() || noteSnippet(note.content);
}

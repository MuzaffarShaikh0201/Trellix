export type NoteSortBy = "title" | "created_at" | "updated_at";

export type NoteSortOrder = "asc" | "desc";

export type NoteProjectRef = {
	id: string;
	title: string;
};

/** Note summary in GET /note list (pinned first, then sorted). */
export type NoteListItem = {
	id: string;
	title?: string;
	content?: string | null;
	project?: NoteProjectRef | null;
	is_pinned: boolean;
	created_at?: string;
	updated_at: string;
};

export type GetNotesParams = {
	project_id?: string;
	personal?: boolean;
	page?: number;
	limit?: number;
	sort_by?: NoteSortBy;
	sort_order?: NoteSortOrder;
};

export type GetNotesResponse = {
	notes: NoteListItem[];
	total_pages: number;
	total_items: number;
	current_page: number;
	items_per_page: number;
};

export type Note = {
	id: string;
	title: string;
	content: string | null;
	project: NoteProjectRef | null;
	is_pinned: boolean;
	created_at: string;
	updated_at: string;
};

export type CreateNoteParams = {
	title: string;
	content?: string | null;
	project_id?: string | null;
};

export type CreateNoteResponse = {
	note_id: string;
};

export type UpdateNoteParams = {
	title?: string | null;
	content?: string | null;
	project_id?: string | null;
};

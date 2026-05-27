import { apiRequest } from "@/lib/api/client";
import type { MessageResponse } from "@/types/auth";
import type {
	CreateNoteParams,
	CreateNoteResponse,
	GetNotesParams,
	GetNotesResponse,
	Note,
	UpdateNoteParams,
} from "@/types/note";

export function fetchNotes(params: GetNotesParams = {}) {
	return apiRequest<GetNotesResponse>("/note", {
		searchParams: params,
	});
}

export function fetchNote(noteId: string) {
	return apiRequest<Note>(`/note/${noteId}`);
}

export function createNote(payload: CreateNoteParams) {
	return apiRequest<CreateNoteResponse>("/note", {
		method: "POST",
		json: payload,
	});
}

export function updateNote(noteId: string, payload: UpdateNoteParams) {
	return apiRequest<MessageResponse>(`/note/${noteId}`, {
		method: "PUT",
		json: payload,
	});
}

export function deleteNote(noteId: string) {
	return apiRequest<MessageResponse>(`/note/${noteId}`, {
		method: "DELETE",
	});
}

export function toggleNotePinned(noteId: string) {
	return apiRequest<MessageResponse>(`/note/${noteId}/toggle-pinned`, {
		method: "PATCH",
	});
}

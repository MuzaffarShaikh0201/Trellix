import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleNotePinned } from "@/lib/api/notes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { noteKeys } from "@/lib/queries";
import { showAlert } from "@/services/alertService";
import type { Note, NoteListItem } from "@/types/note";

/** Pins/unpins a note with an optimistic update across every cached note list. */
export function useTogglePin() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => toggleNotePinned(id),
		onMutate: async (id) => {
			await qc.cancelQueries({ queryKey: noteKeys.all });
			const saved = [
				...qc.getQueriesData({ queryKey: noteKeys.all }),
				...qc.getQueriesData({ queryKey: noteKeys.detail(id) }),
			];
			qc.setQueriesData<{ notes?: NoteListItem[] }>({ queryKey: noteKeys.all }, (data) =>
				data?.notes
					? { ...data, notes: data.notes.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n)) }
					: data,
			);
			qc.setQueryData<Note>(noteKeys.detail(id), (n) => (n ? { ...n, is_pinned: !n.is_pinned } : n));
			return { saved };
		},
		onError: (err, _id, ctx) => {
			ctx?.saved.forEach(([key, data]) => qc.setQueryData(key, data));
			showAlert("Could not update pin", "error", getRequestErrorMessage(err, "Something went wrong while updating pin status."));
		},
		onSettled: (_d, _e, id) =>
			Promise.all([
				qc.invalidateQueries({ queryKey: noteKeys.all }),
				qc.invalidateQueries({ queryKey: noteKeys.detail(id) }),
			]),
	});
}

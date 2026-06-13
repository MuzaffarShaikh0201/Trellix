import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { MdArrowBack, MdEdit, MdPushPin } from "react-icons/md";

import {
	MarkdownEditorPane,
	type MarkdownView,
} from "@/components/note/MarkdownEditorPane";
import { MarkdownContent } from "@/components/note/MarkdownContent";
import { NoteLastUpdated } from "@/components/note/NoteLastUpdated";
import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import {
	OutlinedInputField,
	OutlinedSelectField,
} from "@/components/ui/OutlinedField";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import {
	deleteNote,
	fetchNote,
	toggleNotePinned,
	updateNote,
} from "@/lib/api/notes";
import { fetchProjects } from "@/lib/api/projects";
import { formatProjectDateTime } from "@/lib/project/formatProjectDate";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type { Note } from "@/types/note";

const PROJECT_PICKER_QUERY_KEY = ["projects", "picker"] as const;

type NoteForm = {
	title: string;
	content: string;
	projectId: string;
};

function noteToForm(note: Note): NoteForm {
	return {
		title: note.title,
		content: note.content ?? "",
		projectId: note.project?.id ?? "",
	};
}

function noteFormsEqual(a: NoteForm, b: NoteForm) {
	return (
		a.title === b.title &&
		a.content === b.content &&
		a.projectId === b.projectId
	);
}

export function NotePage() {
	const { noteId } = useParams<{ noteId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const noteQueryKey = ["note", noteId] as const;

	const {
		data: note,
		isPending,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: noteQueryKey,
		queryFn: () => fetchNote(noteId!),
		enabled: Boolean(noteId),
	});

	const { data: projectsPickerData } = useQuery({
		queryKey: PROJECT_PICKER_QUERY_KEY,
		queryFn: () =>
			fetchProjects({
				limit: 100,
				sort_by: "title",
				sort_order: "asc",
				is_archived: false,
			}),
	});

	const [baseline, setBaseline] = useState<NoteForm>({
		title: "",
		content: "",
		projectId: "",
	});
	const [form, setForm] = useState<NoteForm>({
		title: "",
		content: "",
		projectId: "",
	});
	const [contentEditing, setContentEditing] = useState(false);
	const [view, setView] = useState<MarkdownView>("split");

	useEffect(() => {
		if (!note) return;
		const next = noteToForm(note);
		setBaseline(next);
		setForm(next);
		setContentEditing(false);
	}, [note?.id, note?.updated_at, note?.title, note?.content, note?.project?.id]);

	const projectOptions = useMemo(() => {
		const options = (projectsPickerData?.projects ?? []).map((p) => ({
			value: p.id,
			label: p.title,
		}));
		// Keep the note's current project selectable even if archived/excluded.
		if (note?.project && !options.some((o) => o.value === note.project!.id)) {
			options.unshift({ value: note.project.id, label: note.project.title });
		}
		return [{ value: "", label: "Personal note (no project)" }, ...options];
	}, [projectsPickerData?.projects, note?.project]);

	const isDirty = useMemo(
		() => !noteFormsEqual(form, baseline),
		[form, baseline],
	);

	const pinMutation = useMutation({
		mutationFn: () => toggleNotePinned(noteId!),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteQueryKey });
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
		onError: (err) => {
			showAlert(
				"Could not update pin",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating pin status.",
				),
			);
		},
	});

	const updateMutation = useMutation({
		mutationFn: () =>
			updateNote(noteId!, {
				title: form.title.trim(),
				content: form.content.trim() || null,
				project_id: form.projectId || null,
			}),
		onSuccess: async () => {
			showAlert("Note updated", "success", "Your note has been saved.");
			await queryClient.invalidateQueries({ queryKey: noteQueryKey });
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
			setContentEditing(false);
		},
		onError: (err) => {
			showAlert(
				"Update failed",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating this note.",
				),
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteNote(noteId!),
		onSuccess: async () => {
			showAlert("Note deleted", "success", "The note has been removed.");
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
			navigate("/notes");
		},
		onError: (err) => {
			showAlert(
				"Delete failed",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while deleting this note.",
				),
			);
		},
	});

	function patchForm(patch: Partial<NoteForm>) {
		setForm((current) => ({ ...current, ...patch }));
	}

	function handleCancel() {
		setForm(baseline);
		setContentEditing(false);
	}

	function handleUpdate() {
		if (!form.title.trim()) {
			showAlert("Validation Error", "warning", "Note title is required.");
			return;
		}
		updateMutation.mutate();
	}

	function handleDelete() {
		const confirmed = window.confirm(
			"Delete this note? This cannot be undone.",
		);
		if (!confirmed) return;
		void deleteMutation.mutate();
	}

	if (!noteId) {
		return (
			<section className="space-y-4">
				<Link
					to="/notes"
					className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary"
				>
					<MdArrowBack className="h-[18px] w-[18px]" aria-hidden />
					Back to Notes
				</Link>
				<p className="text-sm text-text-secondary">Note not found.</p>
			</section>
		);
	}

	const actionsDisabled = !isDirty || updateMutation.isPending;

	return (
		<section className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="flex shrink-0 items-center justify-between gap-3">
				<Link
					to="/notes"
					className="inline-flex min-w-0 items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
				>
					<MdArrowBack className="h-[18px] w-[18px] shrink-0" aria-hidden />
					Back to Notes
				</Link>
				{note ? (
					<button
						type="button"
						onClick={() => pinMutation.mutate()}
						disabled={pinMutation.isPending}
						className={cn(
							"shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:text-primary",
							note.is_pinned && "text-primary",
							pinMutation.isPending && "cursor-wait opacity-60",
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
				) : null}
			</div>

			{isPending ? (
				<div className="flex items-center justify-center py-16">
					<CustomLoader size={32} aria-label="Loading note" />
				</div>
			) : isError ? (
				<div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
					<p className="text-sm font-medium text-red-600 dark:text-red-400">
						Could not load note
					</p>
					<p className="mt-1 text-sm text-text-secondary">
						{getRequestErrorMessage(
							error,
							"Something went wrong while loading this note.",
						)}
					</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className={cn("mt-3", buttonSecondaryClass())}
					>
						Try again
					</button>
				</div>
			) : note ? (
				<>
					<div className="flex shrink-0 flex-col gap-4 md:flex-row md:items-start">
						<OutlinedInputField
							label="Title"
							value={form.title}
							onChange={(title) => patchForm({ title })}
							placeholder="Note title"
							className="md:flex-1"
						/>
						<OutlinedSelectField
							label="Project"
							value={form.projectId}
							onChange={(projectId) => patchForm({ projectId })}
							options={projectOptions}
							className="w-full md:w-[18rem]"
						/>
					</div>

					<div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
						<span>
							Created{" "}
							<time dateTime={note.created_at}>
								{formatProjectDateTime(note.created_at)}
							</time>
						</span>
						<span aria-hidden>·</span>
						<NoteLastUpdated updatedAt={note.updated_at} inline />
					</div>

					{contentEditing ? (
						<MarkdownEditorPane
							id="note-content"
							value={form.content}
							onChange={(content) => patchForm({ content })}
							view={view}
							onViewChange={setView}
							autoFocus
						/>
					) : (
						<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-primary/10 bg-background-secondary">
							<div className="flex shrink-0 items-center justify-between gap-2 border-b border-primary/10 px-4 py-2">
								<span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
									Content
								</span>
								<button
									type="button"
									onClick={() => setContentEditing(true)}
									className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-tint hover:text-primary"
									title="Edit content"
									aria-label="Edit content"
								>
									<MdEdit className="h-[18px] w-[18px]" aria-hidden />
								</button>
							</div>
							<div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
								{form.content.trim() ? (
									<MarkdownContent content={form.content} />
								) : (
									<p className="text-sm text-text-secondary">No content.</p>
								)}
							</div>
						</div>
					)}

					<div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">
						<Button
							type="button"
							title="Update"
							variant="primary"
							className="w-auto"
							disabled={actionsDisabled}
							loading={updateMutation.isPending}
							onClick={handleUpdate}
							loader={
								<CustomLoader
									size={16}
									color="#ffffff"
									containerStyle={{ width: 16, height: 16 }}
									aria-label="Saving note"
								/>
							}
						/>
						<Button
							type="button"
							title="Cancel"
							variant="secondary"
							className="w-auto"
							disabled={
								updateMutation.isPending || (!isDirty && !contentEditing)
							}
							onClick={handleCancel}
						/>
						<button
							type="button"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className={cn(
								"ml-auto",
								buttonSecondaryClass(),
								"text-red-500 hover:bg-red-500/10 dark:text-red-400",
							)}
						>
							Delete note
						</button>
					</div>
				</>
			) : null}
		</section>
	);
}

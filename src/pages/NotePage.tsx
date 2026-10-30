import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { LuPin, LuTrash2 } from "react-icons/lu";

import { Page } from "@/components/layout/AppShell";
import { TopbarActions } from "@/components/layout/TopbarActions";
import type { MarkdownView } from "@/components/note/MarkdownEditorPane";
import { NoteEditorLayout } from "@/components/note/NoteEditorLayout";
import Button from "@/components/ui/Button";
import { buttonGhostClass, iconButtonClass } from "@/components/ui/buttonStyles";
import { ErrorState, Skeleton } from "@/components/ui/Card";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { deleteNote, fetchNote, updateNote } from "@/lib/api/notes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { readEditorView, storeEditorView } from "@/lib/note/editorView";
import { useTogglePin } from "@/lib/noteQueries";
import { timeAgo } from "@/lib/project/projectDisplay";
import { noteKeys, useAllProjects } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type { Note } from "@/types/note";

type Form = { title: string; content: string; projectId: string };
type SaveState = "saved" | "dirty" | "saving" | "error" | "invalid";

const AUTOSAVE_MS = 1000;

function toForm(note: Note): Form {
	return { title: note.title, content: note.content ?? "", projectId: note.project?.id ?? "" };
}
function sameForm(a: Form, b: Form) {
	return a.title === b.title && a.content === b.content && a.projectId === b.projectId;
}
function toPayload(f: Form) {
	return { title: f.title.trim(), content: f.content.trim() ? f.content : null, project_id: f.projectId || null };
}

export function NotePage() {
	const { noteId } = useParams<{ noteId: string }>();
	const { data: note, isPending, isError, error, refetch, isRefetching } = useQuery({
		queryKey: noteKeys.detail(noteId ?? ""),
		queryFn: () => fetchNote(noteId!),
		enabled: Boolean(noteId),
	});

	if (isError) {
		return (
			<Page>
				<ErrorState
					title="Could not load this note"
					message={getRequestErrorMessage(error, "It may have been deleted, or the server is unavailable.")}
					onRetry={() => void refetch()}
					retrying={isRefetching}
				/>
				<Link to="/notes" className={buttonGhostClass("mt-3")}>
					Back to notes
				</Link>
			</Page>
		);
	}
	if (isPending || !note) {
		return (
			<div className="space-y-4 p-4 md:px-8">
				<Skeleton className="h-8 w-1/2" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		);
	}
	// Remount per note so local edit state never leaks between notes.
	return <NoteEditor key={note.id} note={note} />;
}

function NoteEditor({ note }: { note: Note }) {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const projects = useAllProjects();
	const pin = useTogglePin();

	const [form, setForm] = useState<Form>(() => toForm(note));
	const [view, setViewState] = useState<MarkdownView>(readEditorView);
	const [phase, setPhase] = useState<"idle" | "saving" | "error">("idle");
	const [savedAt, setSavedAt] = useState<string>(note.updated_at);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [baseline, setBaseline] = useState<Form>(() => toForm(note));
	// Latest values for the unmount flush and keyboard shortcut.
	const formRef = useRef(form);
	const baselineRef = useRef(baseline);
	useLayoutEffect(() => {
		formRef.current = form;
		baselineRef.current = baseline;
	}, [form, baseline]);

	const dirty = !sameForm(form, baseline);
	const state: SaveState =
		phase === "saving"
			? "saving"
			: !dirty
				? "saved"
				: !form.title.trim()
					? "invalid"
					: phase === "error"
						? "error"
						: "dirty";

	const projectOptions = useMemo(() => {
		const list = (projects.data?.projects ?? []).map((p) => ({ id: p.id, title: p.title, color: p.color }));
		// Keep the current project selectable even if it's archived.
		if (note.project && !list.some((p) => p.id === note.project!.id)) {
			list.unshift({ id: note.project.id, title: note.project.title, color: null });
		}
		return list;
	}, [projects.data, note.project]);

	const save = useMutation({
		mutationFn: (f: Form) => updateNote(note.id, toPayload(f)),
		onMutate: () => setPhase("saving"),
		onSuccess: (_d, f) => {
			baselineRef.current = f;
			setBaseline(f);
			setPhase("idle");
			const now = new Date().toISOString();
			setSavedAt(now);
			const project = projectOptions.find((p) => p.id === f.projectId);
			qc.setQueryData<Note>(noteKeys.detail(note.id), (n) =>
				n
					? {
							...n,
							title: f.title.trim(),
							content: f.content,
							project: project ? { id: project.id, title: project.title } : null,
							updated_at: now,
						}
					: n,
			);
			void qc.invalidateQueries({ queryKey: noteKeys.all });
		},
		onError: (err) => {
			setPhase("error");
			showAlert("Could not save", "error", getRequestErrorMessage(err, "Your changes are still here. Try again."));
		},
	});

	const mutateSave = save.mutate;
	const saveNow = useCallback(() => {
		const f = formRef.current;
		if (f.title.trim() && !sameForm(f, baselineRef.current)) mutateSave(f);
	}, [mutateSave]);

	// Debounced autosave.
	const canAutosave = dirty && Boolean(form.title.trim());
	useEffect(() => {
		if (!canAutosave) return;
		const t = window.setTimeout(saveNow, AUTOSAVE_MS);
		return () => window.clearTimeout(t);
	}, [form, canAutosave, saveNow]);

	// ⌘S / Ctrl+S saves immediately.
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				saveNow();
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [saveNow]);

	// Warn before closing the tab with unsaved work; flush pending edits when leaving the page.
	useEffect(() => {
		function onBeforeUnload(e: BeforeUnloadEvent) {
			if (!sameForm(formRef.current, baselineRef.current)) e.preventDefault();
		}
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", onBeforeUnload);
			const f = formRef.current;
			if (f.title.trim() && !sameForm(f, baselineRef.current)) {
				void updateNote(note.id, toPayload(f)).then(() => qc.invalidateQueries({ queryKey: noteKeys.all }));
			}
		};
	}, [note.id, qc]);

	const del = useMutation({
		mutationFn: () => deleteNote(note.id),
		onSuccess: async () => {
			baselineRef.current = formRef.current; // nothing left to flush
			showAlert("Note deleted", "success", "The note has been removed.");
			qc.removeQueries({ queryKey: noteKeys.detail(note.id) });
			await qc.invalidateQueries({ queryKey: noteKeys.all });
			navigate("/notes", { replace: true });
		},
		onError: (err) =>
			showAlert("Delete failed", "error", getRequestErrorMessage(err, "Something went wrong while deleting this note.")),
	});

	function setView(v: MarkdownView) {
		setViewState(v);
		storeEditorView(v);
	}

	const status = <SaveStatus state={state} savedAt={savedAt} onRetry={saveNow} />;

	return (
		<>
			<TopbarActions>{status}</TopbarActions>
			<NoteEditorLayout
				title={form.title}
				onTitleChange={(title) => setForm((f) => ({ ...f, title }))}
				content={form.content}
				onContentChange={(content) => setForm((f) => ({ ...f, content }))}
				projectId={form.projectId}
				onProjectChange={(projectId) => setForm((f) => ({ ...f, projectId }))}
				projectOptions={projectOptions}
				view={view}
				onViewChange={setView}
				status={<span className="md:hidden">{status}</span>}
				actions={
					<>
						<button
							type="button"
							onClick={() => pin.mutate(note.id)}
							aria-pressed={note.is_pinned}
							aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
							title={note.is_pinned ? "Unpin" : "Pin"}
							className={iconButtonClass(cn("size-8", note.is_pinned && "text-primary"))}
						>
							<LuPin className={cn("size-4", note.is_pinned && "fill-current")} />
						</button>
						<button
							type="button"
							onClick={() => setDeleteOpen(true)}
							aria-label="Delete note"
							title="Delete"
							className={iconButtonClass("size-8 hover:bg-red-500/10 hover:text-red-600")}
						>
							<LuTrash2 className="size-4" />
						</button>
					</>
				}
			/>
			<Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} locked={del.isPending} ariaLabel="Delete note">
				<div className="px-5 pt-5 pb-4">
					<span className="grid size-10 place-items-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
						<LuTrash2 className="size-5" />
					</span>
					<h2 className="mt-3 text-base font-semibold">Delete “{form.title.trim() || "Untitled note"}”?</h2>
					<p className="mt-1 text-sm text-muted">This can’t be undone.</p>
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={del.isPending}>
						Cancel
					</Button>
					<Button variant="danger" onClick={() => del.mutate()} loading={del.isPending}>
						Delete note
					</Button>
				</DialogFooter>
			</Dialog>
		</>
	);
}

function SaveStatus({ state, savedAt, onRetry }: { state: SaveState; savedAt: string; onRetry: () => void }) {
	// Re-render every 30s so "Saved · 2m ago" stays fresh.
	const [, tick] = useState(0);
	useEffect(() => {
		const t = window.setInterval(() => tick((n) => n + 1), 30_000);
		return () => window.clearInterval(t);
	}, []);

	const map: Record<SaveState, { dot: string; text: string }> = {
		saved: { dot: "bg-emerald-500", text: `Saved · ${timeAgo(savedAt)}` },
		dirty: { dot: "bg-amber-500", text: "Unsaved changes" },
		saving: { dot: "bg-primary animate-pulse", text: "Saving…" },
		error: { dot: "bg-red-500", text: "Not saved" },
		invalid: { dot: "bg-amber-500", text: "Add a title to save" },
	};
	const { dot, text } = map[state];
	return (
		<span className="flex items-center gap-1.5 text-xs text-muted" role="status" aria-live="polite">
			<span className={cn("size-1.5 rounded-full", dot)} />
			{text}
			{state === "error" ? (
				<button type="button" onClick={onRetry} className="ml-1 cursor-pointer font-medium text-primary hover:underline">
					Retry
				</button>
			) : null}
		</span>
	);
}

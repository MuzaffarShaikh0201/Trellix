import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { TopbarActions } from "@/components/layout/TopbarActions";
import type { MarkdownView } from "@/components/note/MarkdownEditorPane";
import { NoteEditorLayout } from "@/components/note/NoteEditorLayout";
import Button from "@/components/ui/Button";
import { buttonGhostClass } from "@/components/ui/buttonStyles";
import { createNote } from "@/lib/api/notes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { readEditorView, storeEditorView } from "@/lib/note/editorView";
import { noteKeys, useAllProjects } from "@/lib/queries";
import { showAlert } from "@/services/alertService";

type LocationState = { lockedProjectTitle?: string } | null;

export function CreateNotePage() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [sp] = useSearchParams();
	const location = useLocation();
	const lockedProjectId = sp.get("projectId")?.trim() || "";
	const lockedTitle = (location.state as LocationState)?.lockedProjectTitle;

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [projectId, setProjectId] = useState(lockedProjectId);
	const [view, setViewState] = useState<MarkdownView>(readEditorView);
	const projects = useAllProjects();

	const projectOptions = useMemo(() => {
		const list = (projects.data?.projects ?? []).map((p) => ({ id: p.id, title: p.title, color: p.color }));
		if (lockedProjectId && !list.some((p) => p.id === lockedProjectId)) {
			list.unshift({ id: lockedProjectId, title: lockedTitle ?? "Selected project", color: null });
		}
		return list;
	}, [projects.data, lockedProjectId, lockedTitle]);

	const cancelTo = lockedProjectId ? `/projects/${lockedProjectId}?tab=notes` : "/notes";
	const dirty = Boolean(title.trim() || content.trim());

	const create = useMutation({
		mutationFn: createNote,
		onSuccess: async ({ note_id }) => {
			showAlert("Note created", "success", "Changes from here on save automatically.");
			await qc.invalidateQueries({ queryKey: noteKeys.all });
			navigate(`/notes/${note_id}`, { replace: true });
		},
		onError: (err) =>
			showAlert("Create failed", "error", getRequestErrorMessage(err, "Something went wrong while creating your note.")),
	});

	function submit() {
		if (!title.trim()) {
			showAlert("Title required", "warning", "Give your note a title before saving.");
			return;
		}
		create.mutate({
			title: title.trim(),
			content: content.trim() ? content : null,
			project_id: (lockedProjectId || projectId) || null,
		});
	}

	const submitRef = useRef(submit);
	useLayoutEffect(() => {
		submitRef.current = submit;
	});

	// ⌘S / Ctrl+S creates the note; warn before closing the tab with a draft.
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				submitRef.current();
			}
		}
		function onBeforeUnload(e: BeforeUnloadEvent) {
			if (dirty && !create.isSuccess) e.preventDefault();
		}
		document.addEventListener("keydown", onKey);
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => {
			document.removeEventListener("keydown", onKey);
			window.removeEventListener("beforeunload", onBeforeUnload);
		};
	}, [dirty, create.isSuccess]);

	function setView(v: MarkdownView) {
		setViewState(v);
		storeEditorView(v);
	}

	const actions = (
		<div className="flex items-center gap-1.5">
			<Link to={cancelTo} className={buttonGhostClass("py-1.5")}>
				Cancel
			</Link>
			<Button className="py-1.5" onClick={submit} loading={create.isPending}>
				Create note
			</Button>
		</div>
	);

	return (
		<>
			<TopbarActions>
				<span className="mr-1 flex items-center gap-1.5 text-xs text-muted">
					<span className="size-1.5 rounded-full bg-amber-500" />
					Draft
				</span>
				{actions}
			</TopbarActions>
			<NoteEditorLayout
				autoFocusTitle
				title={title}
				onTitleChange={setTitle}
				content={content}
				onContentChange={setContent}
				projectId={lockedProjectId || projectId}
				onProjectChange={setProjectId}
				projectOptions={projectOptions}
				projectLocked={Boolean(lockedProjectId)}
				view={view}
				onViewChange={setView}
				actions={<div className="md:hidden">{actions}</div>}
				status={<span className="max-md:hidden">⌘S / Ctrl+S to create</span>}
			/>
		</>
	);
}

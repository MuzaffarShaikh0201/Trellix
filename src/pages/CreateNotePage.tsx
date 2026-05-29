import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Link,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router";
import { MdArrowBack } from "react-icons/md";

import {
	MarkdownEditorPane,
	type MarkdownView,
} from "@/components/note/MarkdownEditorPane";
import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { createNote } from "@/lib/api/notes";
import { fetchProjects } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";

const PROJECT_PICKER_QUERY_KEY = ["projects", "picker"] as const;

const fieldClass = cn(
	"h-9 w-full rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
	"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
);

type LocationState = { lockedProjectTitle?: string } | null;

export function CreateNotePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();
	const location = useLocation();

	const lockedProjectId = searchParams.get("projectId")?.trim() || "";
	const lockedTitleFromState =
		(location.state as LocationState)?.lockedProjectTitle ?? null;

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [projectId, setProjectId] = useState("");
	const [view, setView] = useState<MarkdownView>("split");

	const { data: projectsPickerData, isPending: projectsPickerPending } =
		useQuery({
			queryKey: PROJECT_PICKER_QUERY_KEY,
			queryFn: () =>
				fetchProjects({
					limit: 100,
					sort_by: "title",
					sort_order: "asc",
					is_archived: false,
				}),
		});

	const projectOptions = useMemo(
		() =>
			(projectsPickerData?.projects ?? []).map((p) => ({
				id: p.id,
				title: p.title,
			})),
		[projectsPickerData?.projects],
	);

	const lockedProjectTitle = useMemo(() => {
		if (!lockedProjectId) return null;
		return (
			lockedTitleFromState ??
			projectOptions.find((p) => p.id === lockedProjectId)?.title ??
			"Selected project"
		);
	}, [lockedProjectId, lockedTitleFromState, projectOptions]);

	const effectiveProjectId = lockedProjectId || projectId;

	const cancelTo = lockedProjectId
		? `/projects/${lockedProjectId}`
		: "/notes";

	const createMutation = useMutation({
		mutationFn: createNote,
		onSuccess: async (response) => {
			showAlert("Note created", "success", "Your note has been created.");
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
			navigate(`/notes/${response.note_id}`);
		},
		onError: (err) => {
			showAlert(
				"Create failed",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while creating your note.",
				),
			);
		},
	});

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			showAlert("Validation Error", "warning", "Note title is required.");
			return;
		}
		createMutation.mutate({
			title: trimmedTitle,
			content: content.trim() || null,
			project_id: effectiveProjectId || null,
		});
	}

	const submitting = createMutation.isPending;

	return (
		<form
			onSubmit={handleSubmit}
			className="flex min-h-0 flex-1 flex-col gap-4"
		>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Link
					to={cancelTo}
					className="inline-flex min-w-0 items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
				>
					<MdArrowBack className="h-[18px] w-[18px] shrink-0" aria-hidden />
					{lockedProjectId ? "Back to project" : "Back to Notes"}
				</Link>

				<div className="flex flex-wrap items-center gap-2">
					<Link to={cancelTo} className={buttonSecondaryClass()}>
						Cancel
					</Link>
					<Button
						type="submit"
						title="Create Note"
						variant="primary"
						className="w-auto"
						disabled={submitting}
						loading={submitting}
						loader={
							<CustomLoader
								size={16}
								color="#ffffff"
								containerStyle={{ width: 16, height: 16 }}
								aria-label="Creating note"
							/>
						}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_16rem]">
				<div>
					<label
						htmlFor="create-note-title"
						className="text-xs font-light text-text-primary"
					>
						Title
					</label>
					<input
						id="create-note-title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Sprint planning notes"
						autoComplete="off"
						autoFocus
						className={cn(fieldClass, "mt-1.5")}
					/>
				</div>

				<div>
					<label
						htmlFor="create-note-project"
						className="text-xs font-light text-text-primary"
					>
						Project
					</label>
					{lockedProjectId ? (
						<p
							className={cn(
								fieldClass,
								"mt-1.5 flex cursor-default items-center truncate",
							)}
							aria-readonly
							title={lockedProjectTitle ?? undefined}
						>
							{lockedProjectTitle}
						</p>
					) : (
						<select
							id="create-note-project"
							value={projectId}
							onChange={(e) => setProjectId(e.target.value)}
							disabled={projectsPickerPending}
							className={cn(fieldClass, "mt-1.5 cursor-pointer")}
							aria-label="Link note to project"
						>
							<option value="">Personal note (no project)</option>
							{projectOptions.map((project) => (
								<option key={project.id} value={project.id}>
									{project.title}
								</option>
							))}
						</select>
					)}
				</div>
			</div>

			<MarkdownEditorPane
				id="create-note-content"
				value={content}
				onChange={setContent}
				view={view}
				onViewChange={setView}
			/>
		</form>
	);
}

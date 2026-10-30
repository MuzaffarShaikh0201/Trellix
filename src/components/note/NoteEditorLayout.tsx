import type { ReactNode } from "react";
import { LuChevronDown, LuColumns2, LuEye, LuPencil, LuUser } from "react-icons/lu";

import { MarkdownEditorPane, type MarkdownView } from "@/components/note/MarkdownEditorPane";
import { ProjectDot } from "@/components/project/ProjectTile";
import { Segmented } from "@/components/ui/Segmented";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { wordCount } from "@/lib/note/noteDisplay";

export type ProjectOption = { id: string; title: string; color?: string | null };

type NoteEditorLayoutProps = {
	title: string;
	onTitleChange: (v: string) => void;
	content: string;
	onContentChange: (v: string) => void;
	projectId: string;
	onProjectChange: (id: string) => void;
	projectOptions: ProjectOption[];
	/** When set, the project can't be changed (note created from a project page). */
	projectLocked?: boolean;
	view: MarkdownView;
	onViewChange: (v: MarkdownView) => void;
	/** Buttons next to the view switch (pin, delete, create…). */
	actions?: ReactNode;
	/** Right side of the footer, e.g. save status. */
	status?: ReactNode;
	autoFocusTitle?: boolean;
};

export function NoteEditorLayout({
	title,
	onTitleChange,
	content,
	onContentChange,
	projectId,
	onProjectChange,
	projectOptions,
	projectLocked = false,
	view,
	onViewChange,
	actions,
	status,
	autoFocusTitle = false,
}: NoteEditorLayoutProps) {
	const wide = useMediaQuery("(min-width: 768px)");
	// Split view needs room; phones fall back to the editor.
	const effectiveView: MarkdownView = !wide && view === "split" ? "edit" : view;
	const project = projectOptions.find((p) => p.id === projectId);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="border-b border-line bg-surface px-4 py-3 md:px-8">
				<div className="flex flex-col gap-2 md:flex-row md:items-center">
					<input
						value={title}
						onChange={(e) => onTitleChange(e.target.value)}
						placeholder="Untitled note"
						aria-label="Note title"
						autoFocus={autoFocusTitle}
						maxLength={200}
						className="min-w-0 flex-1 bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-muted/60 md:text-2xl"
					/>
					<div className="flex flex-wrap items-center gap-2">
						<label
							className={
								"relative inline-flex max-w-52 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium " +
								(projectLocked ? "opacity-80" : "cursor-pointer hover:bg-surface-2")
							}
							title={projectLocked ? "This note belongs to the project you came from" : "Move to project"}
						>
							{project ? (
								<ProjectDot project={project} className="size-2" />
							) : (
								<LuUser className="size-3.5 text-muted" />
							)}
							<span className="truncate">{project?.title ?? "Personal"}</span>
							{projectLocked ? null : <LuChevronDown className="size-3 shrink-0 text-muted" />}
							<select
								value={projectId}
								disabled={projectLocked}
								onChange={(e) => onProjectChange(e.target.value)}
								aria-label="Project"
								className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-default"
							>
								<option value="">Personal (no project)</option>
								{projectOptions.map((p) => (
									<option key={p.id} value={p.id}>
										{p.title}
									</option>
								))}
							</select>
						</label>
						{actions}
						<Segmented
							className="ml-auto md:ml-0"
							ariaLabel="Editor view"
							value={effectiveView}
							onChange={onViewChange}
							options={[
								{ value: "edit", label: "Write", icon: <LuPencil className="size-3.5" /> },
								{ value: "split", label: "Split", icon: <LuColumns2 className="size-3.5" />, className: "max-md:hidden" },
								{ value: "preview", label: "Preview", icon: <LuEye className="size-3.5" /> },
							]}
						/>
					</div>
				</div>
			</div>

			<MarkdownEditorPane
				id="note-content"
				value={content}
				onChange={onContentChange}
				view={effectiveView}
				autoFocus={!autoFocusTitle}
			/>

			<div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-4 py-2 pb-[max(.5rem,env(safe-area-inset-bottom))] text-[11px] text-muted md:px-8">
				<span>Markdown · {wordCount(content)} words</span>
				{status}
			</div>
		</div>
	);
}

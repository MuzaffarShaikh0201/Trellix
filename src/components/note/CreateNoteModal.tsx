import type { ChangeEvent, FormEvent } from "react";
import { MdClose } from "react-icons/md";

import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";
import type { NoteProjectRef } from "@/types/note";

type CreateNoteModalProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	title: string;
	content: string;
	projectId: string;
	projects: NoteProjectRef[];
	projectsLoading: boolean;
	onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onContentChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onProjectIdChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	submitting: boolean;
	/** When set, the note is created for this project and the project cannot be changed. */
	lockedProject?: NoteProjectRef | null;
};

const selectClass = cn(
	"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
	"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
);

const textareaClass = cn(
	"mt-1.5 w-full resize-y rounded-lg border border-primary/15 bg-tint px-3 py-2 text-sm text-text-primary",
	"outline-none transition-[box-shadow,border-color] placeholder:text-text-secondary",
	"focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
);

export function CreateNoteModal({
	open,
	onClose,
	onSubmit,
	title,
	content,
	projectId,
	projects,
	projectsLoading,
	onTitleChange,
	onContentChange,
	onProjectIdChange,
	submitting,
	lockedProject = null,
}: CreateNoteModalProps) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[1px]"
			role="presentation"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Create note"
				onClick={(e) => e.stopPropagation()}
				className={cn(
					"absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary/10 bg-background-secondary p-5 shadow-lg sm:p-6",
				)}
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
							Create note
						</p>
						<h2 className="mt-2 text-xl font-bold text-text-primary">
							New note
						</h2>
						<p className="mt-1 text-sm text-text-secondary">
							{lockedProject
								? `This note will be linked to ${lockedProject.title}.`
								: "Add a personal note or link it to a project."}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-tint hover:text-text-primary"
						aria-label="Close create note modal"
					>
						<MdClose className="h-5 w-5" aria-hidden />
					</button>
				</div>

				<form onSubmit={onSubmit} className="mt-5 space-y-4">
					<FormField
						title="Title"
						placeholder="e.g. Sprint planning notes"
						type="text"
						value={title}
						handleChange={onTitleChange}
						autoComplete="off"
					/>

					<div>
						<label
							htmlFor="create-note-content"
							className="text-xs font-light text-text-primary"
						>
							Content
						</label>
						<textarea
							id="create-note-content"
							value={content}
							onChange={onContentChange}
							placeholder="Markdown supported (optional)"
							rows={5}
							className={textareaClass}
						/>
					</div>

					{lockedProject ? (
						<div>
							<span className="text-xs font-light text-text-primary">
								Project
							</span>
							<p
								className={cn(
									selectClass,
									"mt-1.5 flex cursor-default items-center",
								)}
								aria-readonly
							>
								{lockedProject.title}
							</p>
						</div>
					) : (
						<div>
							<label
								htmlFor="create-note-project"
								className="text-xs font-light text-text-primary"
							>
								Project
							</label>
							<select
								id="create-note-project"
								value={projectId}
								onChange={onProjectIdChange}
								disabled={projectsLoading}
								className={selectClass}
								aria-label="Link note to project"
							>
								<option value="">Personal note (no project)</option>
								{projects.map((project) => (
									<option key={project.id} value={project.id}>
										{project.title}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="flex flex-wrap items-center justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className={buttonSecondaryClass()}
						>
							Cancel
						</button>
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
				</form>
			</div>
		</div>
	);
}

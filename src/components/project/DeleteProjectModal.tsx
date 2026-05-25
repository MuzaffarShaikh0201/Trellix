import { useEffect, useId, useState } from "react";
import { MdClose, MdErrorOutline } from "react-icons/md";

import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

const DELETE_CONFIRM_PHRASE = "delete my project";

type DeleteProjectModalProps = {
	open: boolean;
	project: Project;
	onClose: () => void;
	onConfirm: () => void;
	deleting: boolean;
};

function ModalDivider() {
	return <div className="border-t border-primary/10" aria-hidden />;
}

export function DeleteProjectModal({
	open,
	project,
	onClose,
	onConfirm,
	deleting,
}: DeleteProjectModalProps) {
	const titleInputId = useId();
	const phraseInputId = useId();
	const [titleConfirm, setTitleConfirm] = useState("");
	const [phraseConfirm, setPhraseConfirm] = useState("");

	const titleMatches = titleConfirm === project.title;
	const phraseMatches =
		phraseConfirm.trim().toLowerCase() === DELETE_CONFIRM_PHRASE;
	const canDelete = titleMatches && phraseMatches && !deleting;

	useEffect(() => {
		if (!open) {
			setTitleConfirm("");
			setPhraseConfirm("");
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !deleting) onClose();
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, deleting, onClose]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[1px]"
			role="presentation"
			onClick={deleting ? undefined : onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-project-title"
				aria-describedby="delete-project-description"
				onClick={(e) => e.stopPropagation()}
				className={cn(
					"absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[32rem] -translate-x-1/2 -translate-y-1/2",
					"overflow-hidden rounded-xl border border-primary/10 bg-background-secondary shadow-lg",
				)}
			>
				<div className="flex items-start justify-between gap-4 p-5 sm:p-6">
					<div className="min-w-0">
						<h2
							id="delete-project-title"
							className="text-lg font-bold text-text-primary sm:text-xl"
						>
							Delete Project
						</h2>
						<p
							id="delete-project-description"
							className="mt-2 text-sm leading-relaxed text-text-secondary"
						>
							This will permanently delete the project and its associated
							data. This action cannot be undone.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={deleting}
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-tint hover:text-text-primary disabled:opacity-50"
						aria-label="Close delete project modal"
					>
						<MdClose className="h-5 w-5" aria-hidden />
					</button>
				</div>

				<ModalDivider />

				<div className="space-y-4 p-5 sm:p-6">
					<div className="space-y-2">
						<label
							htmlFor={titleInputId}
							className="text-sm text-text-primary"
						>
							To confirm, type{" "}
							<span className="font-semibold">&ldquo;{project.title}&rdquo;</span>
						</label>
						<input
							id={titleInputId}
							type="text"
							value={titleConfirm}
							onChange={(e) => setTitleConfirm(e.target.value)}
							autoComplete="off"
							disabled={deleting}
							className={cn(
								"w-full rounded-lg border-2 border-tint bg-tint px-3 py-2 text-sm text-text-primary outline-none transition-[border-color]",
								"placeholder:text-text-secondary focus:border-primary",
								"disabled:cursor-not-allowed disabled:opacity-60",
							)}
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor={phraseInputId}
							className="text-sm text-text-primary"
						>
							To confirm, type{" "}
							<span className="font-semibold">
								&ldquo;{DELETE_CONFIRM_PHRASE}&rdquo;
							</span>
						</label>
						<input
							id={phraseInputId}
							type="text"
							value={phraseConfirm}
							onChange={(e) => setPhraseConfirm(e.target.value)}
							autoComplete="off"
							disabled={deleting}
							className={cn(
								"w-full rounded-lg border-2 border-tint bg-tint px-3 py-2 text-sm text-text-primary outline-none transition-[border-color]",
								"placeholder:text-text-secondary focus:border-primary",
								"disabled:cursor-not-allowed disabled:opacity-60",
							)}
						/>
					</div>
				</div>

				<ModalDivider />

				<div className="px-5 py-4 sm:px-6">
					<div
						className="flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5"
						role="status"
					>
						<MdErrorOutline
							className="mt-0.5 h-5 w-5 shrink-0 text-red-500 dark:text-red-400"
							aria-hidden
						/>
						<p className="text-sm text-red-500 dark:text-red-400">
							Deleting{" "}
							<span className="font-medium text-text-primary">
								{project.title}
							</span>{" "}
							cannot be undone.
						</p>
					</div>
				</div>

				<ModalDivider />

				<div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
					<button
						type="button"
						onClick={onClose}
						disabled={deleting}
						className={buttonSecondaryClass()}
					>
						Cancel
					</button>
					<Button
						type="button"
						title="Delete Project"
						variant="primary"
						className={cn(
							"w-auto",
							canDelete
								? "border-red-500 bg-red-500 hover:bg-red-600"
								: "border-tint bg-tint text-text-secondary hover:bg-tint",
						)}
						disabled={!canDelete}
						loading={deleting}
						onClick={onConfirm}
						loader={
							<CustomLoader
								size={16}
								color="#ffffff"
								containerStyle={{ width: 16, height: 16 }}
								aria-label="Deleting project"
							/>
						}
					/>
				</div>
			</div>
		</div>
	);
}

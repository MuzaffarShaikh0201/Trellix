import type { ChangeEvent, FormEvent } from "react";
import { MdClose } from "react-icons/md";

import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";

type CreateProjectModalProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	title: string;
	description: string;
	repoUrl: string;
	startDate: string;
	endDate: string;
	onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDescriptionChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onRepoUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onStartDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onEndDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
	submitting: boolean;
};

export function CreateProjectModal({
	open,
	onClose,
	onSubmit,
	title,
	description,
	repoUrl,
	startDate,
	endDate,
	onTitleChange,
	onDescriptionChange,
	onRepoUrlChange,
	onStartDateChange,
	onEndDateChange,
	submitting,
}: CreateProjectModalProps) {
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
				aria-label="Create project"
				onClick={(e) => e.stopPropagation()}
				className={cn(
					"absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary/10 bg-background-secondary p-5 shadow-lg sm:p-6",
				)}
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
							Create project
						</p>
						<h2 className="mt-2 text-xl font-bold text-text-primary">
							New dev project
						</h2>
						<p className="mt-1 text-sm text-text-secondary">
							Add a repo link and timeline to track your work.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-tint hover:text-text-primary"
						aria-label="Close create project modal"
					>
						<MdClose className="h-5 w-5" aria-hidden />
					</button>
				</div>

				<form onSubmit={onSubmit} className="mt-5 space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="sm:col-span-2">
							<FormField
								title="Title"
								placeholder="e.g. Auth service revamp"
								type="text"
								value={title}
								handleChange={onTitleChange}
								autoComplete="off"
							/>
						</div>

						<div className="sm:col-span-2">
							<FormField
								title="Description"
								placeholder="Short description (optional)"
								type="text"
								value={description}
								handleChange={onDescriptionChange}
								autoComplete="off"
							/>
						</div>

						<div className="sm:col-span-2">
							<FormField
								title="Repository URL"
								placeholder="https://github.com/org/repo (optional)"
								type="url"
								value={repoUrl}
								handleChange={onRepoUrlChange}
								autoComplete="off"
							/>
						</div>

						<div>
							<FormField
								title="Start date"
								placeholder=""
								type="date"
								value={startDate}
								handleChange={onStartDateChange}
							/>
						</div>

						<div>
							<FormField
								title="End date"
								placeholder=""
								type="date"
								value={endDate}
								handleChange={onEndDateChange}
							/>
						</div>
					</div>

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
							title="Create Project"
							variant="primary"
							className="w-auto"
							disabled={submitting}
							loading={submitting}
							loader={
								<CustomLoader
									size={16}
									color="#ffffff"
									containerStyle={{ width: 16, height: 16 }}
									aria-label="Creating project"
								/>
							}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}

import type { ChangeEvent, FormEvent } from "react";
import { MdClose } from "react-icons/md";

import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import type { ProjectCategory } from "@/types/project";

type CategoryOption = {
	value: ProjectCategory;
	label: string;
};

type CreateProjectModalProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	title: string;
	description: string;
	category: ProjectCategory;
	startDate: string;
	dueDate: string;
	onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDescriptionChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onCategoryChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	onStartDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDueDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
	categoryOptions: CategoryOption[];
	submitting: boolean;
};

export function CreateProjectModal({
	open,
	onClose,
	onSubmit,
	title,
	description,
	category,
	startDate,
	dueDate,
	onTitleChange,
	onDescriptionChange,
	onCategoryChange,
	onStartDateChange,
	onDueDateChange,
	categoryOptions,
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
							New project
						</h2>
						<p className="mt-1 text-sm text-text-secondary">
							Add details to organize your work.
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
								placeholder="e.g. Build the Trellix dashboard"
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

						<div>
							<label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
								Category
							</label>
							<select
								value={category}
								onChange={onCategoryChange}
								className={cn(
									"mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-primary/15 bg-tint px-3 text-sm text-text-primary",
									"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
								)}
								aria-label="Project category"
							>
								{categoryOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
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
								title="Due date"
								placeholder=""
								type="date"
								value={dueDate}
								handleChange={onDueDateChange}
							/>
						</div>
					</div>

					<div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
						>
							Cancel
						</button>
						<div className="w-full sm:w-40">
							<Button
								type="submit"
								title="Create Project"
								disabled={submitting}
								loading={submitting}
								loader={
									<CustomLoader
										size={24}
										color="#ffffff"
										containerStyle={{ width: 24, height: 24 }}
										aria-label="Creating project"
									/>
								}
							/>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

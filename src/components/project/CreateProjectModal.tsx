import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { LuGithub } from "react-icons/lu";

import Button from "@/components/ui/Button";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { labelClass } from "@/components/ui/fieldStyles";
import { createProject } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { PROJECT_COLOR_SWATCHES, projectInitials } from "@/lib/project/projectDisplay";
import { projectKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";

type CreateProjectModalProps = {
	open: boolean;
	onClose: () => void;
};

const EMPTY = {
	title: "",
	description: "",
	color: PROJECT_COLOR_SWATCHES[0] as string,
	startDate: "",
	endDate: "",
	repoUrl: "",
};

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [form, setForm] = useState(EMPTY);
	const patch = (p: Partial<typeof EMPTY>) => setForm((f) => ({ ...f, ...p }));

	const mutation = useMutation({
		mutationFn: createProject,
		onSuccess: async ({ project_id }) => {
			showAlert("Project created", "success", `“${form.title.trim()}” is ready.`);
			await queryClient.invalidateQueries({ queryKey: projectKeys.all });
			setForm(EMPTY);
			onClose();
			navigate(`/projects/${project_id}`);
		},
		onError: (err) =>
			showAlert(
				"Create failed",
				"error",
				getRequestErrorMessage(err, "Something went wrong while creating your project."),
			),
	});

	const datesInvalid = Boolean(form.startDate && form.endDate && form.endDate < form.startDate);

	function handleClose() {
		if (mutation.isPending) return;
		setForm(EMPTY);
		onClose();
	}

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const title = form.title.trim();
		if (!title) {
			showAlert("Title required", "warning", "Give your project a title.");
			return;
		}
		if (datesInvalid) {
			showAlert("Check the dates", "warning", "The end date is before the start date.");
			return;
		}
		mutation.mutate({
			title,
			description: form.description.trim() || null,
			color: form.color,
			start_date: form.startDate || null,
			end_date: form.endDate || null,
			repo_url: form.repoUrl.trim() || null,
		});
	}

	return (
		<Dialog open={open} onClose={handleClose} locked={mutation.isPending} title="New project">
			<form onSubmit={handleSubmit}>
				<div className="space-y-4 px-5 py-3">
					<div className="flex items-center gap-3">
						<span
							aria-hidden
							className="grid size-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white transition-colors"
							style={{ background: form.color }}
						>
							{projectInitials(form.title || "New Project")}
						</span>
						<TextField
							aria-label="Project title"
							placeholder="Project title"
							value={form.title}
							onChange={(e) => patch({ title: e.target.value })}
							autoFocus
							autoComplete="off"
							maxLength={120}
							className="flex-1"
							inputClassName="text-base font-medium"
						/>
					</div>

					<TextAreaField
						label={
							<>
								Description <span className="font-normal">(optional)</span>
							</>
						}
						rows={2}
						placeholder="What are you building?"
						value={form.description}
						onChange={(e) => patch({ description: e.target.value })}
					/>

					<div>
						<span className={labelClass}>Color</span>
						<div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Project color">
							{PROJECT_COLOR_SWATCHES.map((c) => (
								<button
									key={c}
									type="button"
									role="radio"
									aria-checked={form.color === c}
									aria-label={c}
									onClick={() => patch({ color: c })}
									className={cn(
										"size-7 cursor-pointer rounded-full ring-offset-2 ring-offset-surface transition",
										form.color === c && "ring-2",
									)}
									style={{ background: c, ["--tw-ring-color" as string]: c }}
								/>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<TextField
							label="Start date"
							type="date"
							value={form.startDate}
							onChange={(e) => patch({ startDate: e.target.value })}
						/>
						<TextField
							label="End date"
							type="date"
							value={form.endDate}
							min={form.startDate || undefined}
							onChange={(e) => patch({ endDate: e.target.value })}
							inputClassName={datesInvalid ? "border-red-500 focus:border-red-500" : undefined}
						/>
					</div>

					<TextField
						label={
							<>
								Repository URL <span className="font-normal">(optional)</span>
							</>
						}
						icon={<LuGithub />}
						type="url"
						placeholder="https://github.com/you/repo"
						value={form.repoUrl}
						onChange={(e) => patch({ repoUrl: e.target.value })}
						inputClassName="font-mono text-xs"
						autoComplete="off"
					/>
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={handleClose} disabled={mutation.isPending}>
						Cancel
					</Button>
					<Button type="submit" loading={mutation.isPending}>
						Create project
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

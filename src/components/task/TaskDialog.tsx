import { useState, type FormEvent } from "react";
import { LuTrash2 } from "react-icons/lu";

import Button from "@/components/ui/Button";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { TASK_PRIORITIES, TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/task/taskDisplay";
import { TASK_STATUSES } from "@/lib/taskQueries";
import { formatDay } from "@/lib/project/projectDisplay";
import { showAlert } from "@/services/alertService";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

type TaskDialogProps = {
	task: Task;
	onClose: () => void;
	onSave: (changes: { title: string; description: string | null; priority: TaskPriority; due_date: string | null }) => void;
	onMove: (status: TaskStatus) => void;
	onDelete: () => void;
};

/** Edit a task's details. Mounted per task, so its form starts from the task's values. */
export function TaskDialog({ task, onClose, onSave, onMove, onDelete }: TaskDialogProps) {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description ?? "");
	const [priority, setPriority] = useState<TaskPriority>(task.priority);
	const [due, setDue] = useState(task.due_date ?? "");
	const [status, setStatus] = useState<TaskStatus>(task.status);
	const [confirmDelete, setConfirmDelete] = useState(false);

	function submit(e: FormEvent) {
		e.preventDefault();
		if (!title.trim()) {
			showAlert("Title required", "warning", "A task needs a title.");
			return;
		}
		const changed =
			title.trim() !== task.title ||
			(description.trim() || null) !== (task.description ?? null) ||
			priority !== task.priority ||
			(due || null) !== (task.due_date ?? null);
		if (changed) onSave({ title: title.trim(), description: description.trim() || null, priority, due_date: due || null });
		if (status !== task.status) onMove(status);
		onClose();
	}

	return (
		<Dialog open onClose={onClose} title="Edit task">
			<form onSubmit={submit}>
				<div className="space-y-4 px-5 py-3">
					<TextField
						label="Title"
						value={title}
						maxLength={200}
						autoFocus
						onChange={(e) => setTitle(e.target.value)}
					/>
					<TextAreaField
						label={
							<>
								Description <span className="font-normal">(optional)</span>
							</>
						}
						rows={3}
						maxLength={2000}
						value={description}
						placeholder="Add more detail…"
						onChange={(e) => setDescription(e.target.value)}
					/>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<SelectField
							label="Status"
							value={status}
							onChange={setStatus}
							options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_META[s].label }))}
						/>
						<SelectField
							label="Priority"
							value={priority}
							onChange={setPriority}
							options={TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_META[p].label }))}
						/>
						<TextField
							label="Due date"
							type="date"
							value={due}
							onChange={(e) => setDue(e.target.value)}
							className="col-span-2 sm:col-span-1"
						/>
					</div>
					<p className="text-[11px] text-muted">
						Created {formatDay(task.created_at, true)}
						{task.completed_at ? ` · Completed ${formatDay(task.completed_at, true)}` : ""}
					</p>
				</div>
				<DialogFooter className="sm:justify-between">
					{confirmDelete ? (
						<Button
							variant="danger"
							icon={<LuTrash2 className="size-4" />}
							onClick={() => {
								onDelete();
								onClose();
							}}
						>
							Confirm delete
						</Button>
					) : (
						<Button
							variant="ghost"
							className="text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
							icon={<LuTrash2 className="size-4" />}
							onClick={() => setConfirmDelete(true)}
						>
							Delete
						</Button>
					)}
					<div className="flex flex-col-reverse gap-2 sm:flex-row">
						<Button variant="secondary" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Save</Button>
					</div>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

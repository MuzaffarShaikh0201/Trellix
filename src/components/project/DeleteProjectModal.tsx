import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";

import Button from "@/components/ui/Button";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/Field";
import type { Project } from "@/types/project";

type DeleteProjectModalProps = {
	open: boolean;
	project: Project;
	onClose: () => void;
	onConfirm: () => void;
	/** Offered as the safer option. Hidden for projects that are already archived. */
	onArchive?: () => void;
	deleting: boolean;
};

export function DeleteProjectModal({
	open,
	project,
	onClose,
	onConfirm,
	onArchive,
	deleting,
}: DeleteProjectModalProps) {
	const [typed, setTyped] = useState("");
	const matches = typed.trim() === project.title.trim();

	function close() {
		setTyped("");
		onClose();
	}

	return (
		<Dialog open={open} onClose={close} locked={deleting} ariaLabel="Delete project">
			<div className="px-5 pt-5 pb-4">
				<span className="grid size-10 place-items-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
					<LuTrash2 className="size-5" />
				</span>
				<h2 className="mt-3 text-base font-semibold">Delete “{project.title}”?</h2>
				<p className="mt-1 text-sm text-muted">
					This permanently removes the project and can’t be undone.
					{onArchive ? " If you might need it later, archive it instead." : null}
				</p>
				<TextField
					className="mt-4"
					label={
						<>
							Type <span className="font-semibold text-fg">{project.title}</span> to confirm
						</>
					}
					value={typed}
					onChange={(e) => setTyped(e.target.value)}
					autoComplete="off"
					disabled={deleting}
					onKeyDown={(e) => {
						if (e.key === "Enter" && matches) onConfirm();
					}}
				/>
			</div>
			<DialogFooter>
				{onArchive ? (
					<Button variant="secondary" onClick={onArchive} disabled={deleting}>
						Archive instead
					</Button>
				) : (
					<Button variant="secondary" onClick={close} disabled={deleting}>
						Cancel
					</Button>
				)}
				<Button variant="danger" onClick={onConfirm} disabled={!matches} loading={deleting}>
					Delete project
				</Button>
			</DialogFooter>
		</Dialog>
	);
}

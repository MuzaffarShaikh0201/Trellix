import { useNavigate } from "react-router";
import { LuFilePlus, LuFolderPlus } from "react-icons/lu";

import { Dialog } from "@/components/ui/Dialog";

type QuickAddSheetProps = {
	open: boolean;
	onClose: () => void;
	onCreateProject: () => void;
};

/** Opened by the + button in the mobile bottom bar. */
export function QuickAddSheet({ open, onClose, onCreateProject }: QuickAddSheetProps) {
	const navigate = useNavigate();
	const row =
		"flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-2";
	return (
		<Dialog open={open} onClose={onClose} ariaLabel="Create" className="md:max-w-sm">
			<div className="p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
				<p className="px-2 pb-2 text-xs font-semibold tracking-wider text-muted uppercase">Create</p>
				<button
					type="button"
					className={row}
					onClick={() => {
						onClose();
						onCreateProject();
					}}
				>
					<span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
						<LuFolderPlus className="size-5" />
					</span>
					<span>
						<span className="block text-sm font-medium">New project</span>
						<span className="text-xs text-muted">Title, dates, color, repo</span>
					</span>
				</button>
				<button
					type="button"
					className={row}
					onClick={() => {
						onClose();
						navigate("/notes/new");
					}}
				>
					<span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
						<LuFilePlus className="size-5" />
					</span>
					<span>
						<span className="block text-sm font-medium">New note</span>
						<span className="text-xs text-muted">Markdown, for a project or personal</span>
					</span>
				</button>
			</div>
		</Dialog>
	);
}

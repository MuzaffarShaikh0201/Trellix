import { MdAdd, MdDescription } from "react-icons/md";

import { noteCardShellClass } from "@/components/note/note-card-shell";
import { cn } from "@/lib/utils";

export function CreateNoteCard({ onCreate }: { onCreate: () => void }) {
	return (
		<article className={cn("group self-start", noteCardShellClass, "p-4")}>
			<div className="flex flex-col items-center text-center">
				<div className="relative">
					<MdDescription
						className="h-10 w-10 text-text-primary opacity-90"
						aria-hidden
					/>
					<span
						className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm"
						aria-hidden
					>
						<MdAdd className="h-3.5 w-3.5" />
					</span>
				</div>

				<p className="mt-3 text-sm font-medium leading-snug text-text-primary">
					Capture a new note?
				</p>

				<button
					type="button"
					onClick={onCreate}
					className={cn(
						"mt-3 rounded-lg border border-primary/50 bg-transparent px-4 py-1.5 text-sm font-medium text-text-primary",
						"transition-colors hover:border-primary hover:bg-primary/10",
					)}
				>
					Create Note
				</button>
			</div>
		</article>
	);
}

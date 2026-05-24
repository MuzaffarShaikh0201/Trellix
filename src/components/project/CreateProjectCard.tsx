import { MdAdd, MdDescription } from "react-icons/md";

import { projectCardShellClass } from "@/components/project/project-card-shell";
import { cn } from "@/lib/utils";

export function CreateProjectCard({ onCreate }: { onCreate: () => void }) {
	return (
		<article
			className={cn(
				"group",
				projectCardShellClass,
				"items-center justify-center p-4 text-center",
			)}
		>
			<div className="flex flex-col items-center justify-center">
				<div className="relative">
					<MdDescription
						className="h-14 w-14 text-text-primary opacity-90"
						aria-hidden
					/>
					<span
						className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
						aria-hidden
					>
						<MdAdd className="h-4 w-4" />
					</span>
				</div>

				<p className="mt-5 text-sm font-medium text-text-primary">
					Up for a new project?
				</p>

				<button
					type="button"
					onClick={onCreate}
					className={cn(
						"mt-5 rounded-lg border border-primary/50 bg-transparent px-5 py-2 text-sm font-medium text-text-primary",
						"transition-colors hover:border-primary hover:bg-primary/10",
					)}
				>
					Create Project
				</button>
			</div>
		</article>
	);
}

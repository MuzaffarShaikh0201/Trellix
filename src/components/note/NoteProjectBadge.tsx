import { LuUser } from "react-icons/lu";

import { projectColor } from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";
import type { NoteProjectRef } from "@/types/note";

type NoteProjectBadgeProps = {
	project: NoteProjectRef | null | undefined;
	/** Project color from GET /project when known. */
	color?: string | null;
	className?: string;
};

/** "Project name" chip with its color, or "Personal" for notes without a project. */
export function NoteProjectBadge({ project, color, className }: NoteProjectBadgeProps) {
	const cls = cn(
		"inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted",
		className,
	);
	if (!project) {
		return (
			<span className={cls}>
				<LuUser className="size-3 shrink-0" aria-hidden />
				Personal
			</span>
		);
	}
	return (
		<span className={cls} title={project.title}>
			<span
				aria-hidden
				className="size-2 shrink-0 rounded-sm"
				style={{ background: projectColor({ id: project.id, color }) }}
			/>
			<span className="truncate">{project.title}</span>
		</span>
	);
}

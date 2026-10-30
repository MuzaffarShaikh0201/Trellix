import { projectColor, projectInitials } from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";

type ProjectTileProps = {
	project: { id: string; title: string; color?: string | null };
	className?: string;
};

/** Colored initials square that identifies a project. */
export function ProjectTile({ project, className }: ProjectTileProps) {
	return (
		<span
			aria-hidden
			className={cn(
				"grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white",
				className,
			)}
			style={{ background: projectColor(project) }}
		>
			{projectInitials(project.title)}
		</span>
	);
}

/** Small colored square used in lists and chips. */
export function ProjectDot({
	project,
	className,
}: {
	project: { id: string; color?: string | null };
	className?: string;
}) {
	return (
		<span
			aria-hidden
			className={cn("size-2.5 shrink-0 rounded-[3px]", className)}
			style={{ background: projectColor(project) }}
		/>
	);
}

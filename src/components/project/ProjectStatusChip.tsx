import { PROJECT_STATUS_META } from "@/lib/project/projectStatusStyles";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

type ProjectStatusChipProps = {
	status: ProjectStatus;
	className?: string;
};

export function ProjectStatusChip({ status, className }: ProjectStatusChipProps) {
	const meta = PROJECT_STATUS_META[status];
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
				meta.pill,
				className,
			)}
		>
			<span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
			{meta.label}
		</span>
	);
}

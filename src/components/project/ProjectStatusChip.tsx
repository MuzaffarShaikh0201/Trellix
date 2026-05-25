import {
	formatProjectStatusLabel,
	projectStatusChipBaseClass,
	projectStatusClassMap,
} from "@/lib/project/projectStatusStyles";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

type ProjectStatusChipProps = {
	status: ProjectStatus;
	className?: string;
};

export function ProjectStatusChip({ status, className }: ProjectStatusChipProps) {
	return (
		<span
			className={cn(
				projectStatusChipBaseClass,
				projectStatusClassMap[status],
				className,
			)}
		>
			{formatProjectStatusLabel(status)}
		</span>
	);
}

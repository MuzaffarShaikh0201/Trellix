import { RECENT_PROJECTS_ROW_COUNT } from "@/lib/project/recentProject";
import { cn } from "@/lib/utils";

const tdClass = "px-3 py-3 align-middle md:px-4";

function SkeletonCell({ className }: { className?: string }) {
	return (
		<div
			className={cn("animate-pulse rounded bg-tint", className)}
			aria-hidden
		/>
	);
}

function RecentProjectsSkeletonRow() {
	return (
		<tr className="border-t border-primary/10">
			<td className={cn(tdClass, "max-w-0")}>
				<SkeletonCell className="h-4 w-[min(100%,9rem)] md:w-36" />
			</td>
			<td className={tdClass}>
				<SkeletonCell className="h-6 w-24 rounded-full" />
			</td>
			<td className={cn(tdClass, "text-center")}>
				<SkeletonCell className="mx-auto size-4 rounded-sm" />
			</td>
			<td className={tdClass}>
				<SkeletonCell className="h-4 w-28 md:w-32" />
			</td>
			<td className={tdClass}>
				<SkeletonCell className="h-4 w-28 md:w-32" />
			</td>
		</tr>
	);
}

export function RecentProjectsTableSkeleton() {
	return (
		<>
			{Array.from({ length: RECENT_PROJECTS_ROW_COUNT }, (_, index) => (
				<RecentProjectsSkeletonRow key={`recent-project-skeleton-${index}`} />
			))}
		</>
	);
}

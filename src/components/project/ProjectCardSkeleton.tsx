import { projectCardShellClass } from "@/components/project/project-card-shell";
import { cn } from "@/lib/utils";

export function ProjectCardSkeleton() {
	return (
		<div
			className={cn(
				projectCardShellClass,
				"animate-pulse bg-background-secondary/40",
			)}
		>
			<div className="flex flex-1 flex-col p-4 pb-3">
				<div className="flex items-start justify-between">
					<div className="h-11 w-11 rounded-full bg-tint" />
					<div className="flex gap-1">
						<div className="h-7 w-7 rounded-md bg-tint" />
						<div className="h-7 w-7 rounded-md bg-tint" />
					</div>
				</div>
				<div className="mt-3 h-5 w-[min(100%,10rem)] rounded bg-tint" />
				<div className="mt-2 h-4 w-24 rounded bg-tint" />
				<div className="mt-2 h-5 w-16 rounded border border-tint bg-tint" />
				<div className="mt-4 grid flex-1 grid-cols-2 gap-3">
					<div className="space-y-2">
						<div className="h-3 w-20 rounded bg-tint" />
						<div className="h-4 w-16 rounded bg-tint" />
						<div className="h-1 w-full rounded-full bg-tint" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-24 rounded bg-tint" />
						<div className="flex justify-between">
							<div className="h-4 w-8 rounded bg-tint" />
							<div className="h-4 w-10 rounded bg-tint" />
						</div>
						<div className="h-1 w-full rounded-full bg-tint" />
					</div>
				</div>
			</div>
			<div className="mt-auto grid grid-cols-2 gap-4 bg-transparent px-4 py-3 max-sm:bg-tint">
				<div className="space-y-1.5">
					<div className="h-3 w-16 rounded bg-tint" />
					<div className="h-4 w-24 rounded bg-tint" />
				</div>
				<div className="space-y-1.5">
					<div className="h-3 w-16 rounded bg-tint" />
					<div className="h-4 w-24 rounded bg-tint" />
				</div>
			</div>
		</div>
	);
}

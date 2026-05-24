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
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1 space-y-2">
						<div className="h-5 w-[min(100%,10rem)] rounded bg-tint" />
						<div className="h-5 w-16 rounded border border-tint bg-tint" />
					</div>
					<div className="h-7 w-7 shrink-0 rounded-md bg-tint" />
				</div>
				<div className="mt-4 inline-flex h-6 w-fit max-w-[70%] items-center gap-1.5 rounded-full bg-tint px-2.5">
					<div className="size-3.5 shrink-0 rounded-full bg-tint/40" />
					<div className="h-3 w-20 rounded-full bg-tint/40" />
				</div>
				<div className="min-h-2 flex-1" aria-hidden />
				<div className="grid shrink-0 grid-cols-2 gap-3">
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

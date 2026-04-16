export function ProjectCardSkeleton() {
	return (
		<div className="h-[27rem] animate-pulse rounded-xl border border-primary/10 bg-background-secondary p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-tint" />
					<div className="space-y-2">
						<div className="h-3 w-28 rounded bg-tint" />
						<div className="h-3 w-20 rounded bg-tint" />
					</div>
				</div>
				<div className="h-5 w-5 rounded bg-tint" />
			</div>
			<div className="mt-4 flex gap-2">
				<div className="h-6 w-20 rounded bg-tint" />
				<div className="h-6 w-24 rounded bg-tint" />
			</div>
			<div className="mt-4 space-y-2">
				<div className="h-3 w-full rounded bg-tint" />
				<div className="h-3 w-11/12 rounded bg-tint" />
				<div className="h-3 w-9/12 rounded bg-tint" />
			</div>
			<div className="mt-4 rounded-lg border border-primary/10 bg-tint p-3">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-2">
						<div className="h-3 w-20 rounded bg-background-secondary" />
						<div className="h-3 w-24 rounded bg-background-secondary" />
						<div className="h-1.5 w-full rounded bg-background-secondary" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-20 rounded bg-background-secondary" />
						<div className="h-3 w-24 rounded bg-background-secondary" />
						<div className="h-1.5 w-full rounded bg-background-secondary" />
					</div>
				</div>
			</div>
			<div className="mt-4 rounded-lg border border-primary/10 bg-tint p-3">
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-2">
						<div className="h-3 w-16 rounded bg-background-secondary" />
						<div className="h-3 w-20 rounded bg-background-secondary" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-16 rounded bg-background-secondary" />
						<div className="h-3 w-20 rounded bg-background-secondary" />
					</div>
				</div>
			</div>
		</div>
	);
}

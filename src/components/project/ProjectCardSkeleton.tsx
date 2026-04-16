export function ProjectCardSkeleton() {
	return (
		<div className="h-[19rem] animate-pulse rounded-xl border border-primary/15 bg-background-secondary p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2">
					<div className="h-10 w-10 shrink-0 rounded-full border border-primary/20 bg-tint" />
					<div className="min-w-0 space-y-2">
						<div className="h-6 w-[min(100%,14rem)] rounded bg-tint" />
						<div className="h-5 w-20 rounded-md bg-tint" />
					</div>
				</div>
				<div className="shrink-0 pt-0.5">
					<div className="h-8 w-8 rounded-md bg-tint" />
				</div>
			</div>

			<div className="mt-3 h-5 w-full max-w-full rounded bg-tint" />

			<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="rounded-lg border border-primary/10 bg-tint p-3">
					<div className="h-3 w-24 rounded bg-background-secondary" />
					<div className="mt-2 flex gap-2">
						<div className="h-4 w-6 rounded bg-background-secondary" />
						<div className="h-4 w-6 rounded bg-background-secondary" />
						<div className="h-4 w-6 rounded bg-background-secondary" />
					</div>
					<div className="mt-2 h-1.5 w-full rounded-full bg-background-secondary" />
				</div>
				<div className="rounded-lg border border-primary/10 bg-tint p-3">
					<div className="h-3 w-28 rounded bg-background-secondary" />
					<div className="mt-2 flex items-center justify-between">
						<div className="h-4 w-10 rounded bg-background-secondary" />
						<div className="h-4 w-14 rounded bg-background-secondary" />
					</div>
					<div className="mt-2 h-1.5 w-full rounded-full bg-background-secondary" />
				</div>
			</div>

			<div className="mt-4">
				<div className="grid grid-cols-2 gap-3 rounded-lg border border-primary/10 bg-tint p-3">
					<div className="space-y-2">
						<div className="h-3 w-16 rounded bg-background-secondary" />
						<div className="h-4 w-24 rounded bg-background-secondary" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-16 rounded bg-background-secondary" />
						<div className="h-4 w-24 rounded bg-background-secondary" />
					</div>
				</div>
			</div>
		</div>
	);
}

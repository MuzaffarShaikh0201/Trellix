import { noteCardShellClass } from "@/components/note/note-card-shell";
import { cn } from "@/lib/utils";

export function NoteCardSkeleton() {
	return (
		<div
			className={cn(
				noteCardShellClass,
				"self-start animate-pulse bg-background-secondary/40",
			)}
		>
			<div className="flex flex-col p-4">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1 space-y-2">
						<div className="h-5 w-[min(100%,10rem)] rounded bg-tint" />
						<div className="mt-1.5 h-6 w-28 rounded bg-tint" />
					</div>
					<div className="h-7 w-7 shrink-0 rounded-md bg-tint" />
				</div>
				<div className="mt-4 h-4 w-32 rounded bg-tint" />
			</div>
		</div>
	);
}

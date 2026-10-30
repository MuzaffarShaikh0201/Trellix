import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
	return (
		<span
			role="status"
			aria-label="Loading"
			className={cn(
				"inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
				className,
			)}
		/>
	);
}

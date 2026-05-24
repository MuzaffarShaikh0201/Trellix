import { cn } from "@/lib/utils";

type HeaderNavDividerProps = {
	className?: string;
};

/** Vertical rule with centered diamond ornament (reference header). */
export function HeaderNavDivider({ className }: HeaderNavDividerProps) {
	return (
		<div
			className={cn(
				"relative flex h-5 w-px shrink-0 items-center justify-center",
				className,
			)}
			aria-hidden
		>
			<div className="h-full w-px bg-text-secondary/30" />
			<span className="absolute size-1.5 rotate-45 border border-text-secondary/35 bg-background-secondary" />
		</div>
	);
}

import { cn } from "@/lib/utils";

/** Note grid cards: full border and surface at rest; stronger outline on hover. */
export const noteCardShellClass = cn(
	"flex min-w-0 flex-col overflow-hidden rounded-xl",
	"border border-tint bg-background-secondary shadow-sm",
	"transition-[background-color,box-shadow,border-color] duration-200 ease-out",
	"hover:border-primary/45 hover:shadow-md",
);

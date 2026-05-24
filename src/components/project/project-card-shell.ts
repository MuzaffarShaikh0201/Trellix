import { cn } from "@/lib/utils";

/** Flush grid cards: no default border/bg; hover reveals surface + outline. */
export const projectCardShellClass = cn(
	"flex h-[19rem] min-w-0 flex-col overflow-hidden rounded-xl",
	"border-0 bg-transparent",
	"transition-[background-color,box-shadow] duration-200 ease-out",
	"hover:bg-background-secondary hover:shadow-sm",
	"hover:ring-1 hover:ring-primary/45",
);

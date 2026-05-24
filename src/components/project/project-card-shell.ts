import { cn } from "@/lib/utils";

/** Flush grid cards: no default border/bg; hover reveals surface + outline. Mobile always shows surface. */
export const projectCardShellClass = cn(
	"flex h-[19rem] min-w-0 flex-col overflow-hidden rounded-xl",
	"border-0 bg-transparent",
	"transition-[background-color,box-shadow] duration-200 ease-out",
	"max-sm:bg-background-secondary max-sm:shadow-sm max-sm:ring-1 max-sm:ring-primary/45",
	"sm:hover:bg-background-secondary sm:hover:shadow-sm sm:hover:ring-1 sm:hover:ring-primary/45",
);

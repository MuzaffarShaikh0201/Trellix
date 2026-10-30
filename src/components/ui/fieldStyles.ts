import { cn } from "@/lib/utils";

export const inputClass = cn(
	"w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition",
	"placeholder:text-muted/70 focus:border-primary focus:ring-3 focus:ring-primary/15",
	"disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted",
);

export const labelClass = "mb-1.5 block text-xs font-medium text-muted";

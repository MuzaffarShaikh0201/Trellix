import { cn } from "@/lib/utils";

const base = cn(
	"inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition",
	"outline-none focus-visible:ring-3 focus-visible:ring-primary/30",
	"disabled:pointer-events-none disabled:opacity-50",
);

export const buttonBaseClass = base;

export function buttonPrimaryClass(className?: string) {
	return cn(
		base,
		"bg-primary px-3 py-2 text-white shadow-sm shadow-primary/20 hover:bg-primary-strong active:scale-[.98]",
		className,
	);
}

export function buttonSecondaryClass(className?: string) {
	return cn(
		base,
		"border border-line bg-surface px-3 py-2 text-fg hover:bg-surface-2",
		className,
	);
}

export function buttonGhostClass(className?: string) {
	return cn(
		base,
		"px-2 py-2 text-muted hover:bg-surface-2 hover:text-fg",
		className,
	);
}

export function buttonDangerClass(className?: string) {
	return cn(
		base,
		"bg-red-600 px-3 py-2 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 active:scale-[.98]",
		className,
	);
}

/** Square icon-only button. */
export function iconButtonClass(className?: string) {
	return cn(
		base,
		"size-9 shrink-0 text-muted hover:bg-surface-2 hover:text-fg",
		className,
	);
}

/** Row inside a dropdown menu. */
export const menuItemClass = cn(
	"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-fg transition-colors",
	"hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50",
);

/** Floating panel for menus and popovers. */
export const popoverPanelClass =
	"rounded-xl border border-line bg-overlay p-1 shadow-overlay animate-pop";

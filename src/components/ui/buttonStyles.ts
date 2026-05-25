import { cn } from "@/lib/utils";

/** Shared compact button sizing used across the app. */
export const buttonSizeClass = "px-3 py-1.5 text-xs font-medium";

export const buttonBaseClass = cn(
	"inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md transition-colors",
	"disabled:pointer-events-none disabled:opacity-50",
	buttonSizeClass,
);

export function buttonPrimaryClass(className?: string) {
	return cn(
		buttonBaseClass,
		"border border-primary bg-primary text-white hover:bg-blue-600",
		className,
	);
}

export function buttonSecondaryClass(className?: string) {
	return cn(
		buttonBaseClass,
		"bg-primary/10 text-primary hover:bg-primary/20",
		className,
	);
}

/** Tint panel + colored label (project detail actions). */
const actionButtonTintBase = cn(
	buttonBaseClass,
	"rounded-lg border-0 bg-tint px-2.5 shadow-none",
);

/** Warning / favorites — `text-yellow-500` (alert warning family). */
export function actionButtonWarningClass(className?: string) {
	return cn(
		actionButtonTintBase,
		"text-yellow-500 hover:bg-yellow-500/10",
		className,
	);
}

/** Primary — archive / restore. */
export function actionButtonPrimaryTintClass(className?: string) {
	return cn(
		actionButtonTintBase,
		"text-primary hover:bg-primary/10",
		className,
	);
}

/** Error / delete — `text-red-500` (alert error family). */
export function actionButtonDangerClass(className?: string) {
	return cn(
		actionButtonTintBase,
		"text-red-500 hover:bg-red-500/10 dark:text-red-400",
		className,
	);
}

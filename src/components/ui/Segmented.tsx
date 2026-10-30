import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
	value: T;
	label?: ReactNode;
	icon?: ReactNode;
	title?: string;
	className?: string;
};

type SegmentedProps<T extends string> = {
	value: T;
	onChange: (value: T) => void;
	options: SegmentedOption<T>[];
	ariaLabel: string;
	className?: string;
	/** Icon-only buttons are square. */
	iconOnly?: boolean;
};

export function Segmented<T extends string>({
	value,
	onChange,
	options,
	ariaLabel,
	className,
	iconOnly = false,
}: SegmentedProps<T>) {
	return (
		<div role="group" aria-label={ariaLabel} className={cn("flex rounded-lg bg-surface-2 p-0.5", className)}>
			{options.map((o) => {
				const active = o.value === value;
				return (
					<button
						key={o.value}
						type="button"
						title={o.title}
						aria-label={iconOnly ? o.title : undefined}
						aria-pressed={active}
						onClick={() => onChange(o.value)}
						className={cn(
							"flex cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-medium transition",
							iconOnly ? "size-8" : "flex-1 px-3 py-1.5",
							active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
							o.className,
						)}
					>
						{o.icon}
						{o.label}
					</button>
				);
			})}
		</div>
	);
}

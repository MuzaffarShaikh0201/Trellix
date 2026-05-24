import type { ReactNode } from "react";

import { useProjectGridColumns } from "@/components/project/useProjectGridColumns";
import { cn } from "@/lib/utils";

type ProjectCardGridCellProps = {
	index: number;
	children: ReactNode;
};

const dividerClass = "bg-text-secondary/20";

/**
 * Inset dividers between grid cells (do not meet at corners).
 * Horizontal rules only between rows (top edge of row 2+), never on the grid outer top/bottom.
 */
export function ProjectCardGridCell({
	index,
	children,
}: ProjectCardGridCellProps) {
	const cols = useProjectGridColumns();
	const col = index % cols;
	const row = Math.floor(index / cols);
	const showRight = col < cols - 1;
	const showTop = row > 0;

	return (
		<div className="relative min-w-0">
			{showTop ? (
				<div
					className={cn(
						"pointer-events-none absolute left-3 right-3 top-0 z-10 hidden h-px sm:block",
						dividerClass,
					)}
					aria-hidden
				/>
			) : null}
			{showRight ? (
				<div
					className={cn(
						"pointer-events-none absolute bottom-3 right-0 top-3 z-10 hidden w-px sm:block",
						dividerClass,
					)}
					aria-hidden
				/>
			) : null}
			{children}
		</div>
	);
}

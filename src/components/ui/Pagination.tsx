import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

import { iconButtonClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";

export type PaginationProps = {
	startItem: number;
	endItem: number;
	totalItems: number;
	canGoPrev: boolean;
	canGoNext: boolean;
	onFirstPage: () => void;
	onPrevPage: () => void;
	onNextPage: () => void;
	onLastPage: () => void;
	pageLimit?: number;
	pageLimitOptions?: number[];
	onPageLimitChange?: (limit: number) => void;
	className?: string;
};

export function Pagination({
	startItem,
	endItem,
	totalItems,
	canGoPrev,
	canGoNext,
	onFirstPage,
	onPrevPage,
	onNextPage,
	onLastPage,
	pageLimit,
	pageLimitOptions,
	onPageLimitChange,
	className,
}: PaginationProps) {
	if (totalItems === 0) return null;
	const btn = iconButtonClass("size-8 disabled:opacity-30");
	return (
		<div className={cn("flex flex-wrap items-center justify-between gap-3 text-xs text-muted", className)}>
			<p className="tabular-nums">
				Showing <span className="font-medium text-fg">{startItem}–{endItem}</span> of{" "}
				<span className="font-medium text-fg">{totalItems}</span>
			</p>
			<div className="flex items-center gap-3">
				{pageLimit && pageLimitOptions && onPageLimitChange ? (
					<label className="flex items-center gap-1.5">
						<span className="max-sm:hidden">Per page</span>
						<select
							value={pageLimit}
							onChange={(e) => onPageLimitChange(Number(e.target.value))}
							className="cursor-pointer rounded-md border border-line bg-surface px-1.5 py-1 text-xs text-fg outline-none focus:border-primary"
							aria-label="Items per page"
						>
							{pageLimitOptions.map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
				) : null}
				<div className="flex items-center">
					<button type="button" className={btn} onClick={onFirstPage} disabled={!canGoPrev} aria-label="First page">
						<LuChevronsLeft className="size-4" />
					</button>
					<button type="button" className={btn} onClick={onPrevPage} disabled={!canGoPrev} aria-label="Previous page">
						<LuChevronLeft className="size-4" />
					</button>
					<button type="button" className={btn} onClick={onNextPage} disabled={!canGoNext} aria-label="Next page">
						<LuChevronRight className="size-4" />
					</button>
					<button type="button" className={btn} onClick={onLastPage} disabled={!canGoNext} aria-label="Last page">
						<LuChevronsRight className="size-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

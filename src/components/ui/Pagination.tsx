import {
	MdChevronLeft,
	MdChevronRight,
	MdFirstPage,
	MdLastPage,
} from "react-icons/md";

import { cn } from "@/lib/utils";

export type PaginationProps = {
	rowsPerPage: number;
	onRowsPerPageChange: (next: number) => void;
	startItem: number;
	endItem: number;
	totalItems: number;
	canGoPrev: boolean;
	canGoNext: boolean;
	onFirstPage: () => void;
	onPrevPage: () => void;
	onNextPage: () => void;
	onLastPage: () => void;
	/** For `htmlFor` / `id` — use a unique value when multiple paginations exist on one screen. */
	pageSizeSelectId?: string;
	pageSizeLabel?: string;
};

export function Pagination({
	rowsPerPage,
	onRowsPerPageChange,
	startItem,
	endItem,
	totalItems,
	canGoPrev,
	canGoNext,
	onFirstPage,
	onPrevPage,
	onNextPage,
	onLastPage,
	pageSizeSelectId = "pagination-page-size",
	pageSizeLabel = "Rows per page",
}: PaginationProps) {
	return (
		<footer className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-primary/10 bg-background-secondary p-3 text-sm text-text-secondary">
			<div className="flex items-center gap-2">
				<label htmlFor={pageSizeSelectId}>{pageSizeLabel}</label>
				<select
					id={pageSizeSelectId}
					value={rowsPerPage}
					onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
					className={cn(
						"h-8 cursor-pointer rounded-md border border-primary/15 bg-background-secondary px-2 text-sm text-text-primary",
						"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
					)}
				>
					<option value={6}>6</option>
					<option value={12}>12</option>
					<option value={24}>24</option>
					<option value={36}>36</option>
				</select>
			</div>

			<div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
				<p className="min-w-24 text-right tabular-nums">
					{startItem}-{endItem} of {totalItems}
				</p>

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={onFirstPage}
						disabled={!canGoPrev}
						className={cn(
							"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
							!canGoPrev && "cursor-not-allowed opacity-40",
						)}
						aria-label="First page"
					>
						<MdFirstPage className="h-5 w-5" aria-hidden />
					</button>
					<button
						type="button"
						onClick={onPrevPage}
						disabled={!canGoPrev}
						className={cn(
							"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
							!canGoPrev && "cursor-not-allowed opacity-40",
						)}
						aria-label="Previous page"
					>
						<MdChevronLeft className="h-5 w-5" aria-hidden />
					</button>
					<button
						type="button"
						onClick={onNextPage}
						disabled={!canGoNext}
						className={cn(
							"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
							!canGoNext && "cursor-not-allowed opacity-40",
						)}
						aria-label="Next page"
					>
						<MdChevronRight className="h-5 w-5" aria-hidden />
					</button>
					<button
						type="button"
						onClick={onLastPage}
						disabled={!canGoNext}
						className={cn(
							"rounded-md p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",
							!canGoNext && "cursor-not-allowed opacity-40",
						)}
						aria-label="Last page"
					>
						<MdLastPage className="h-5 w-5" aria-hidden />
					</button>
				</div>
			</div>
		</footer>
	);
}

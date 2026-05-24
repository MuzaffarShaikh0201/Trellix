import {
	MdChevronLeft,
	MdChevronRight,
	MdFirstPage,
	MdLastPage,
} from "react-icons/md";

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
}: PaginationProps) {
	return (
		<footer className="mt-1 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 bg-transparent p-3 text-sm text-text-secondary">
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
		</footer>
	);
}

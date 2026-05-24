import { useEffect, useId, useRef, useState } from "react";

import {

	MdCheck,

	MdChevronLeft,

	MdChevronRight,

	MdExpandMore,

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

	pageLimit?: number;

	pageLimitOptions?: number[];

	onPageLimitChange?: (limit: number) => void;

	className?: string;

};



type PageLimitDropdownProps = {

	pageLimit: number;

	options: number[];

	onChange: (limit: number) => void;

};



function PageLimitDropdown({

	pageLimit,

	options,

	onChange,

}: PageLimitDropdownProps) {

	const [open, setOpen] = useState(false);

	const rootRef = useRef<HTMLDivElement>(null);

	const listboxId = useId();



	useEffect(() => {

		if (!open) return;



		function onPointerDown(event: PointerEvent) {

			if (

				rootRef.current &&

				!rootRef.current.contains(event.target as Node)

			) {

				setOpen(false);

			}

		}



		function onKeyDown(event: KeyboardEvent) {

			if (event.key === "Escape") setOpen(false);

		}



		document.addEventListener("pointerdown", onPointerDown);

		document.addEventListener("keydown", onKeyDown);

		return () => {

			document.removeEventListener("pointerdown", onPointerDown);

			document.removeEventListener("keydown", onKeyDown);

		};

	}, [open]);



	return (

		<div ref={rootRef} className="relative flex items-center gap-1 whitespace-nowrap">

			<span className="text-text-secondary">limit:</span>

			<button

				type="button"

				id={`${listboxId}-trigger`}

				aria-haspopup="listbox"

				aria-expanded={open}

				aria-controls={open ? `${listboxId}-list` : undefined}

				onClick={() => setOpen((v) => !v)}

				className={cn(

					"flex cursor-pointer items-center gap-0.5 rounded tabular-nums text-text-primary outline-none transition-colors",

					"hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/25",

					open && "text-primary",

				)}

			>

				{pageLimit}

				<MdExpandMore

					className={cn(

						"h-3.5 w-3.5 shrink-0 transition-transform",

						open && "rotate-180",

					)}

					aria-hidden

				/>

			</button>

			{open ? (

				<ul

					id={`${listboxId}-list`}

					role="listbox"

					aria-labelledby={`${listboxId}-trigger`}

					aria-label="Items per page"

					className={cn(

						"absolute bottom-full left-0 z-50 mb-1 min-w-[3.25rem] overflow-hidden rounded-lg border border-primary/15 py-1 shadow-lg",

						"bg-background-secondary",

					)}

				>

					{options.map((option) => {

						const selected = option === pageLimit;

						return (

							<li key={option} role="presentation">

								<button

									type="button"

									role="option"

									aria-selected={selected}

									onClick={() => {

										onChange(option);

										setOpen(false);

									}}

									className={cn(

										"flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left tabular-nums transition-colors",

										"text-text-primary hover:bg-primary/10",

										selected && "bg-primary/15 font-medium text-primary",

									)}

								>

									{option}

									{selected ? (

										<MdCheck

											className="h-3.5 w-3.5 shrink-0 text-primary"

											aria-hidden

										/>

									) : (

										<span className="w-3.5 shrink-0" aria-hidden />

									)}

								</button>

							</li>

						);

					})}

				</ul>

			) : null}

		</div>

	);

}



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

	const showPageLimit =

		pageLimit != null &&

		pageLimitOptions != null &&

		pageLimitOptions.length > 0 &&

		onPageLimitChange != null;



	return (

		<footer

			className={cn(

				"flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 bg-transparent text-text-secondary",

				className,

			)}

		>

			{showPageLimit ? (

				<PageLimitDropdown

					pageLimit={pageLimit}

					options={pageLimitOptions}

					onChange={onPageLimitChange}

				/>

			) : null}



			<div className="ml-auto flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5">

				<p className="min-w-20 text-right tabular-nums">

					{startItem}-{endItem} of {totalItems}

				</p>



				<div className="flex items-center gap-1">

					<button

						type="button"

						onClick={onFirstPage}

						disabled={!canGoPrev}

						className={cn(

							"rounded p-0.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",

							!canGoPrev && "cursor-not-allowed opacity-40",

						)}

						aria-label="First page"

					>

						<MdFirstPage className="h-4 w-4" aria-hidden />

					</button>

					<button

						type="button"

						onClick={onPrevPage}

						disabled={!canGoPrev}

						className={cn(

							"rounded p-0.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",

							!canGoPrev && "cursor-not-allowed opacity-40",

						)}

						aria-label="Previous page"

					>

						<MdChevronLeft className="h-4 w-4" aria-hidden />

					</button>

					<button

						type="button"

						onClick={onNextPage}

						disabled={!canGoNext}

						className={cn(

							"rounded p-0.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",

							!canGoNext && "cursor-not-allowed opacity-40",

						)}

						aria-label="Next page"

					>

						<MdChevronRight className="h-4 w-4" aria-hidden />

					</button>

					<button

						type="button"

						onClick={onLastPage}

						disabled={!canGoNext}

						className={cn(

							"rounded p-0.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary",

							!canGoNext && "cursor-not-allowed opacity-40",

						)}

						aria-label="Last page"

					>

						<MdLastPage className="h-4 w-4" aria-hidden />

					</button>

				</div>

			</div>

		</footer>

	);

}



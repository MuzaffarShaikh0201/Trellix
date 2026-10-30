/** Computes the numbers Pagination needs from an API page response. */
export function pageInfo(page: number, limit: number, totalItems: number, totalPages: number) {
	const pages = Math.max(1, totalPages);
	const current = Math.min(page, pages);
	return {
		current,
		pages,
		startItem: totalItems === 0 ? 0 : (current - 1) * limit + 1,
		endItem: Math.min(current * limit, totalItems),
		canGoPrev: current > 1,
		canGoNext: current < pages,
	};
}

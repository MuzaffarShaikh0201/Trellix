import { useEffect, useState } from "react";

const SM = 640;
const LG = 1024;
const XL = 1280;

function columnsForWidth(width: number): number {
	if (width >= XL) return 5;
	if (width >= LG) return 4;
	if (width >= SM) return 2;
	return 1;
}

/** Matches ProjectsPage grid: 1 → sm:2 → lg:4 → xl:5 columns. */
export function useProjectGridColumns(): number {
	const [cols, setCols] = useState(() =>
		typeof window !== "undefined" ? columnsForWidth(window.innerWidth) : 1,
	);

	useEffect(() => {
		function update() {
			setCols(columnsForWidth(window.innerWidth));
		}
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return cols;
}

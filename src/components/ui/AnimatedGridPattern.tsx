import { motion } from "motion/react";
import {
	type ComponentPropsWithoutRef,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import { cn } from "@/lib/utils";

type Square = { id: number; pos: [number, number] };

function generateSquares(
	count: number,
	containerWidth: number,
	containerHeight: number,
	cellWidth: number,
	cellHeight: number,
): Square[] {
	if (
		containerWidth <= 0 ||
		containerHeight <= 0 ||
		cellWidth <= 0 ||
		cellHeight <= 0
	) {
		return [];
	}

	const cols = Math.floor(containerWidth / cellWidth);
	const rows = Math.floor(containerHeight / cellHeight);
	if (cols < 1 || rows < 1) {
		return [];
	}

	return Array.from({ length: count }, (_, i) => ({
		id: i,
		pos: [
			Math.floor(Math.random() * cols),
			Math.floor(Math.random() * rows),
		] as [number, number],
	}));
}

export interface AnimatedGridPatternProps
	extends ComponentPropsWithoutRef<"svg"> {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	strokeDasharray?: number | string;
	numSquares?: number;
	maxOpacity?: number;
	duration?: number;
	repeatDelay?: number;
}

export function AnimatedGridPattern({
	width: cellWidth = 40,
	height: cellHeight = 40,
	x = -1,
	y = -1,
	strokeDasharray = 0,
	numSquares = 50,
	className,
	maxOpacity = 0.5,
	duration = 4,
	repeatDelay = 0.5,
	...props
}: AnimatedGridPatternProps) {
	const patternId = useId();
	const containerRef = useRef<SVGSVGElement>(null);
	const dimensionsRef = useRef({ width: 0, height: 0 });

	const [squares, setSquares] = useState<Square[]>([]);

	const updateSquarePosition = useCallback(
		(squareId: number) => {
			const { width: cw, height: ch } = dimensionsRef.current;
			setSquares((current) =>
				current.map((sq) => {
					if (sq.id !== squareId) return sq;
					const next = generateSquares(
						1,
						cw,
						ch,
						cellWidth,
						cellHeight,
					)[0];
					return next ? { ...sq, pos: next.pos } : sq;
				}),
			);
		},
		[cellWidth, cellHeight],
	);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const applyLayout = () => {
			const { width, height } = el.getBoundingClientRect();
			dimensionsRef.current = { width, height };
			if (width > 0 && height > 0) {
				setSquares(
					generateSquares(
						numSquares,
						width,
						height,
						cellWidth,
						cellHeight,
					),
				);
			} else {
				setSquares([]);
			}
		};

		const resizeObserver = new ResizeObserver(applyLayout);
		resizeObserver.observe(el);
		const rafId = requestAnimationFrame(applyLayout);

		return () => {
			cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
		};
	}, [numSquares, cellWidth, cellHeight]);

	return (
		<svg
			ref={containerRef}
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 h-full w-full fill-tint stroke-gray-400/30",
				className,
			)}
			{...props}
		>
			<defs>
				<pattern
					id={patternId}
					width={cellWidth}
					height={cellHeight}
					patternUnits="userSpaceOnUse"
					x={x}
					y={y}
				>
					<path
						d={`M.5 ${cellHeight}V.5H${cellWidth}`}
						fill="none"
						strokeDasharray={strokeDasharray}
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
			<svg x={x} y={y} className="overflow-visible">
				{squares.map(({ pos: [gx, gy], id: squareId }, index) => (
					<motion.rect
						key={`${squareId}-${gx}-${gy}-${index}`}
						initial={{ opacity: 0 }}
						animate={{ opacity: maxOpacity }}
						transition={{
							duration,
							repeat: 1,
							delay: index * 0.1,
							repeatDelay,
							repeatType: "reverse",
						}}
						onAnimationComplete={() =>
							updateSquarePosition(squareId)
						}
						width={cellWidth - 1}
						height={cellHeight - 1}
						x={gx * cellWidth + 1}
						y={gy * cellHeight + 1}
						fill="currentColor"
						strokeWidth="0"
					/>
				))}
			</svg>
		</svg>
	);
}

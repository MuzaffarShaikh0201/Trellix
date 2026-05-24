import { cn } from "@/lib/utils";

type CircularProgressRingProps = {
	value: number;
	size?: number;
	className?: string;
};

export function CircularProgressRing({
	value,
	size = 44,
	className,
}: CircularProgressRingProps) {
	const clamped = Math.min(100, Math.max(0, value));
	const stroke = 3;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (clamped / 100) * circumference;
	const center = size / 2;

	return (
		<div
			className={cn("relative shrink-0", className)}
			style={{ width: size, height: size }}
			role="img"
			aria-label={`${clamped}% complete`}
		>
			<svg width={size} height={size} className="-rotate-90" aria-hidden>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={stroke}
					className="text-tint"
				/>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="text-emerald-500 transition-[stroke-dashoffset] duration-300"
				/>
			</svg>
			<span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold leading-none text-text-primary">
				{clamped}%
			</span>
		</div>
	);
}

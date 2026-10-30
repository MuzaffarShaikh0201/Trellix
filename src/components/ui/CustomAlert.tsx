import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { LuCircleAlert, LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from "react-icons/lu";

import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";

const TYPE_STYLES: Record<AlertType, { Icon: IconType; icon: string; bar: string }> = {
	success: { Icon: LuCircleCheck, icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
	error: { Icon: LuCircleAlert, icon: "bg-red-500/15 text-red-600 dark:text-red-400", bar: "bg-red-500" },
	warning: { Icon: LuTriangleAlert, icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
	info: { Icon: LuInfo, icon: "bg-primary/15 text-primary", bar: "bg-primary" },
};

export type CustomAlertProps = {
	type: AlertType;
	title: string;
	description: string | readonly string[];
	onClose: () => void;
	/** Auto-dismiss duration in ms. Errors stay a little longer by default. */
	durationMs?: number;
	/** Kept for compatibility; toasts are always positioned by AlertHost. */
	stacked?: boolean;
};

export default function CustomAlert({ type, title, description, onClose, durationMs }: CustomAlertProps) {
	const duration = durationMs ?? (type === "error" ? 8000 : 5000);
	const { Icon, icon, bar } = TYPE_STYLES[type];
	const [paused, setPaused] = useState(false);
	const remaining = useRef(duration);
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);
	const close = useCallback(() => onCloseRef.current(), []);

	// Count down while not hovered; hovering pauses so people can read long messages.
	useEffect(() => {
		if (paused) return;
		const started = Date.now();
		const t = window.setTimeout(close, remaining.current);
		return () => {
			window.clearTimeout(t);
			remaining.current = Math.max(0, remaining.current - (Date.now() - started));
		};
	}, [paused, close]);

	const items = Array.isArray(description) ? description : null;

	return (
		<div
			role={type === "error" ? "alert" : "status"}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			className="relative w-full overflow-hidden rounded-xl border border-line bg-overlay text-fg shadow-overlay"
		>
			<div className="flex items-start gap-3 p-3 pr-2">
				<span className={cn("grid size-7 shrink-0 place-items-center rounded-full", icon)}>
					<Icon className="size-4" />
				</span>
				<div className="min-w-0 flex-1 pt-0.5">
					<p className="text-sm font-semibold">{title}</p>
					{items ? (
						<ul className="mt-0.5 list-inside list-disc text-xs text-muted">
							{items.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					) : description ? (
						<p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
					) : null}
				</div>
				<button
					type="button"
					onClick={close}
					aria-label="Dismiss"
					className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg"
				>
					<LuX className="size-4" />
				</button>
			</div>
			<div
				aria-hidden
				className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left opacity-60", bar)}
				style={{
					animation: `toast-progress ${duration}ms linear forwards`,
					animationPlayState: paused ? "paused" : "running",
				}}
			/>
		</div>
	);
}

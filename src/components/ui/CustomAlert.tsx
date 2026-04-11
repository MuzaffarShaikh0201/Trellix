import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";

import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";

const TYPE_STYLES: Record<AlertType, string> = {
	warning: "bg-yellow-500",
	error: "bg-red-500",
	success: "bg-green-600",
	info: "bg-blue-500",
};

export type CustomAlertProps = {
	type: AlertType;
	title: string;
	description: string | readonly string[];
	onClose: () => void;
	/** Auto-dismiss duration in ms (default 10_000). */
	durationMs?: number;
	/**
	 * When true, omits fixed positioning and slide-from-side entrance so a parent
	 * stack can position and animate the toast.
	 */
	stacked?: boolean;
};

export default function CustomAlert({
	type,
	title,
	description,
	onClose,
	durationMs = 10_000,
	stacked = false,
}: CustomAlertProps) {
	const [progress, setProgress] = useState(100);
	const [isOpen, setIsOpen] = useState(true);
	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	/** Keeps latest `onClose` without restarting the auto-dismiss timer on parent re-renders. */
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	const handleClose = useCallback(() => {
		setIsOpen(false);
		if (closeTimeoutRef.current !== null) {
			clearTimeout(closeTimeoutRef.current);
		}
		closeTimeoutRef.current = setTimeout(() => {
			closeTimeoutRef.current = null;
			onCloseRef.current();
		}, 500);
	}, []);

	useEffect(() => {
		return () => {
			if (closeTimeoutRef.current !== null) {
				clearTimeout(closeTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const intervalMs = 100;
		let elapsed = 0;

		const timer = window.setInterval(() => {
			elapsed += intervalMs;
			const percent = 100 - (elapsed / durationMs) * 100;
			setProgress(percent);

			if (elapsed >= durationMs) {
				window.clearInterval(timer);
				handleClose();
			}
		}, intervalMs);

		return () => window.clearInterval(timer);
	}, [isOpen, durationMs, handleClose]);

	const bgColor = TYPE_STYLES[type];
	const items = Array.isArray(description) ? description : null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					role="alert"
					initial={
						stacked
							? false
							: { x: 300, opacity: 0 }
					}
					animate={{ x: 0, opacity: 1 }}
					exit={
						stacked
							? { opacity: 0, scale: 0.96, filter: "blur(4px)" }
							: { x: 600, opacity: 0 }
					}
					transition={{ duration: stacked ? 0.35 : 0.5 }}
					className={cn(
						"z-50 w-full max-w-sm overflow-hidden rounded-lg text-white shadow-lg",
						!stacked &&
							"fixed right-6 bottom-6 w-4/5 max-w-sm sm:w-full",
						bgColor,
					)}
				>
					<div className="relative flex items-center justify-center px-6 pt-4">
						<h3 className="text-sm font-medium">{title}</h3>
						<button
							type="button"
							onClick={handleClose}
							className="absolute top-2 right-2 cursor-pointer rounded p-1 hover:bg-white/10"
							aria-label="Dismiss alert"
						>
							<MdClose className="size-5" />
						</button>
					</div>

					<div className="flex justify-center px-4 pb-4">
						{items ? (
							<ul className="list-inside list-disc text-xs">
								{items.map((item, index) => (
									<li key={index}>{item}</li>
								))}
							</ul>
						) : (
							<p className="text-xs">{description}</p>
						)}
					</div>

					<div className="h-1 w-full bg-white/40">
						<motion.div
							className="h-1 bg-white"
							initial={{ width: "100%" }}
							animate={{ width: `${Math.max(0, progress)}%` }}
							transition={{ ease: "linear", duration: 0.1 }}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

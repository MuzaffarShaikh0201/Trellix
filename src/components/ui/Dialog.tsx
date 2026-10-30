import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";

import { iconButtonClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";

type DialogProps = {
	open: boolean;
	onClose: () => void;
	/** Blocks closing (Esc / backdrop) while something is in flight. */
	locked?: boolean;
	title?: ReactNode;
	ariaLabel?: string;
	/** "center" = dialog on desktop, bottom sheet on mobile. "top" = command palette style. */
	placement?: "center" | "top";
	className?: string;
	children: ReactNode;
};

export function Dialog({
	open,
	onClose,
	locked = false,
	title,
	ariaLabel,
	placement = "center",
	className,
	children,
}: DialogProps) {
	useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape" && !locked) onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			document.removeEventListener("keydown", onKey);
		};
	}, [open, locked, onClose]);

	if (!open) return null;

	return createPortal(
		<div
			role="presentation"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget && !locked) onClose();
			}}
			className={cn(
				"fixed inset-0 z-70 flex animate-fade justify-center bg-backdrop",
				placement === "top"
					? "items-start px-3 pt-[12vh]"
					: "items-end md:items-center md:p-4",
			)}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
				className={cn(
					"w-full border border-line bg-overlay shadow-overlay",
					placement === "top"
						? "max-w-xl animate-pop overflow-hidden rounded-2xl"
						: "max-h-[92dvh] max-w-lg animate-sheet overflow-y-auto rounded-t-2xl md:animate-pop md:rounded-2xl",
					className,
				)}
			>
				{placement === "center" ? (
					<div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden />
				) : null}
				{title ? (
					<div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
						<h2 className="text-base font-semibold">{title}</h2>
						<button
							type="button"
							onClick={onClose}
							disabled={locked}
							className={iconButtonClass("size-8")}
							aria-label="Close"
						>
							<LuX className="size-4" />
						</button>
					</div>
				) : null}
				{children}
			</div>
		</div>,
		document.body,
	);
}

/** Footer row for dialog actions, padded for the iOS home indicator. */
export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse gap-2 border-t border-line px-5 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end",
				className,
			)}
		>
			{children}
		</div>
	);
}

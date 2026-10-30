import { useEffect, type RefObject } from "react";

/** Closes a popover on outside pointer-down or Escape. */
export function useDismiss(
	ref: RefObject<HTMLElement | null>,
	open: boolean,
	onClose: () => void,
) {
	useEffect(() => {
		if (!open) return;
		function onPointerDown(e: PointerEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) onClose();
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [ref, open, onClose]);
}

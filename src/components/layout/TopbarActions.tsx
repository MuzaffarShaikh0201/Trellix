import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { useShell } from "@/components/layout/shell-context";

/** Renders its children into the right side of the desktop top bar. */
export function TopbarActions({ children }: { children: ReactNode }) {
	const { topbarSlot } = useShell();
	return topbarSlot ? createPortal(children, topbarSlot) : null;
}

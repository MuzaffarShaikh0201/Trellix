import { createContext, useContext } from "react";

export type ShellContextValue = {
	openCreateProject: () => void;
	openPalette: () => void;
	openQuickAdd: () => void;
	/** DOM node in the desktop top bar where pages can portal extra actions. */
	topbarSlot: HTMLElement | null;
};

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
	const ctx = useContext(ShellContext);
	if (!ctx) throw new Error("useShell must be used inside <AppShell>");
	return ctx;
}

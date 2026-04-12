import { createContext } from "react";

/** User-selected appearance (persisted). */
export type Theme = "light" | "dark" | "system";

/** Effective light/dark applied to the document. */
export type ResolvedTheme = "light" | "dark";

export type ThemeContextValue = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

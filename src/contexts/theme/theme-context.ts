import { createContext } from "react";

/** User-selected appearance (persisted). */
export type Theme = "light" | "dark" | "system";

/** Effective light/dark applied to the document. */
export type ResolvedTheme = "light" | "dark";

/** Comfortable = default sizing; compact shrinks the root font so everything tightens. */
export type Density = "comfortable" | "compact";

export type ThemeContextValue = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	density: Density;
	setDensity: (density: Density) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

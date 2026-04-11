import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { ThemeContext, type Theme } from "./theme-context";

/** Kept in sync with the inline script in `index.html`. */
const THEME_STORAGE_KEY = "trellix-theme";

function getSystemTheme(): Theme {
	if (typeof window === "undefined") {
		return "light";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function readStoredTheme(): Theme | null {
	try {
		const raw = localStorage.getItem(THEME_STORAGE_KEY);
		if (raw === "light" || raw === "dark") return raw;
	} catch {
		/* private mode or blocked storage */
	}
	return null;
}

function readInitialTheme(): Theme {
	return readStoredTheme() ?? getSystemTheme();
}

function persistTheme(theme: Theme): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		/* ignore */
	}
}

function applyTheme(theme: Theme): void {
	const root = document.documentElement;
	if (theme === "dark") {
		root.setAttribute("data-theme", "dark");
	} else {
		root.removeAttribute("data-theme");
	}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(readInitialTheme);

	useLayoutEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next = prev === "light" ? "dark" : "light";
			persistTheme(next);
			return next;
		});
	}, []);

	const value = useMemo(
		() => ({ theme, toggleTheme }),
		[theme, toggleTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { ThemeContext, type ResolvedTheme, type Theme } from "./theme-context";

/** Kept in sync with the inline script in `index.html`. */
const THEME_STORAGE_KEY = "trellix-theme";

function readStoredTheme(): Theme | null {
	try {
		const raw = localStorage.getItem(THEME_STORAGE_KEY);
		if (raw === "light" || raw === "dark" || raw === "system") return raw;
	} catch {
		/* private mode or blocked storage */
	}
	return null;
}

function readInitialTheme(): Theme {
	return readStoredTheme() ?? "system";
}

function persistTheme(theme: Theme): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		/* ignore */
	}
}

function applyResolvedTheme(resolved: ResolvedTheme): void {
	const root = document.documentElement;
	if (resolved === "dark") {
		root.setAttribute("data-theme", "dark");
	} else {
		root.removeAttribute("data-theme");
	}
}

function resolveTheme(
	preference: Theme,
	systemIsDark: boolean,
): ResolvedTheme {
	if (preference === "light") return "light";
	if (preference === "dark") return "dark";
	return systemIsDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(readInitialTheme);
	const [systemIsDark, setSystemIsDark] = useState(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches,
	);

	useLayoutEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => setSystemIsDark(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	const resolvedTheme = useMemo(
		() => resolveTheme(theme, systemIsDark),
		[theme, systemIsDark],
	);

	useLayoutEffect(() => {
		applyResolvedTheme(resolvedTheme);
	}, [resolvedTheme]);

	const setThemeValue = useCallback((next: Theme) => {
		persistTheme(next);
		setThemeState(next);
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeState((prev) => {
			const resolved = resolveTheme(prev, systemIsDark);
			const next: Theme = resolved === "light" ? "dark" : "light";
			persistTheme(next);
			return next;
		});
	}, [systemIsDark]);

	const value = useMemo(
		() => ({
			theme,
			resolvedTheme,
			setTheme: setThemeValue,
			toggleTheme,
		}),
		[theme, resolvedTheme, setThemeValue, toggleTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

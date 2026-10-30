import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { ThemeContext, type Density, type ResolvedTheme, type Theme } from "./theme-context";

/** Kept in sync with the inline script in `index.html`. */
const THEME_STORAGE_KEY = "trellix-theme";
const DENSITY_STORAGE_KEY = "trellix-density";

function readStoredDensity(): Density {
	try {
		return localStorage.getItem(DENSITY_STORAGE_KEY) === "compact" ? "compact" : "comfortable";
	} catch {
		return "comfortable";
	}
}

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

	const [density, setDensityState] = useState<Density>(readStoredDensity);

	useLayoutEffect(() => {
		if (density === "compact") document.documentElement.setAttribute("data-density", "compact");
		else document.documentElement.removeAttribute("data-density");
	}, [density]);

	const setDensity = useCallback((next: Density) => {
		try {
			localStorage.setItem(DENSITY_STORAGE_KEY, next);
		} catch {
			/* ignore */
		}
		setDensityState(next);
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
			density,
			setDensity,
		}),
		[theme, resolvedTheme, setThemeValue, toggleTheme, density, setDensity],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

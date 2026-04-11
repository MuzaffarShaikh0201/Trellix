import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { ThemeContext, type Theme } from "./theme-context";

function getSystemTheme(): Theme {
	if (typeof window === "undefined") {
		return "light";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
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
	const [theme, setTheme] = useState<Theme>(getSystemTheme);

	useLayoutEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	}, []);

	const value = useMemo(
		() => ({ theme, toggleTheme }),
		[theme, toggleTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

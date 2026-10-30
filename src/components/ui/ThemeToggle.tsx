import { LuMoon, LuSun } from "react-icons/lu";

import { iconButtonClass } from "@/components/ui/buttonStyles";
import { useTheme } from "@/contexts/theme/useTheme";

export function ThemeToggle() {
	const { resolvedTheme, toggleTheme } = useTheme();
	const dark = resolvedTheme === "dark";
	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
			className={iconButtonClass()}
		>
			{dark ? <LuSun className="size-4" /> : <LuMoon className="size-4" />}
		</button>
	);
}

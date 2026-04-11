import { useTheme } from "@/contexts/theme/useTheme";
import { MdLightMode, MdDarkMode } from "react-icons/md";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	const nextMode = theme === "dark" ? "light" : "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={`Switch to ${nextMode} mode`}
			className="flex cursor-pointer items-center justify-center text-text-primary"
		>
			{theme === "dark" ? (
				<MdLightMode className="w-5 h-5" />
			) : (
				<MdDarkMode className="w-5 h-5" />
			)}
		</button>
	);
}

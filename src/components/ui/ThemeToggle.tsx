import { useTheme } from "@/contexts/theme/useTheme";
import { MdLightMode, MdDarkMode } from "react-icons/md";

export function ThemeToggle() {
	const { resolvedTheme, toggleTheme } = useTheme();

	const nextMode = resolvedTheme === "dark" ? "light" : "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={`Switch to ${nextMode} mode`}
			className="flex cursor-pointer items-center justify-center text-text-primary"
		>
			{resolvedTheme === "dark" ? (
				<MdLightMode className="w-5 h-5" />
			) : (
				<MdDarkMode className="w-5 h-5" />
			)}
		</button>
	);
}

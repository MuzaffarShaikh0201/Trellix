import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
	LuLogOut,
	LuMessageCircle,
	LuMonitor,
	LuMoon,
	LuScale,
	LuSettings,
	LuSun,
} from "react-icons/lu";

import { menuItemClass, popoverPanelClass } from "@/components/ui/buttonStyles";
import { useAuth } from "@/contexts/auth";
import type { Theme } from "@/contexts/theme/theme-context";
import { useTheme } from "@/contexts/theme/useTheme";
import { useDismiss } from "@/hooks/useDismiss";
import { cn } from "@/lib/utils";

function userInitials(first?: string, last?: string): string {
	const s =
		`${first?.trim().charAt(0) ?? ""}${last?.trim().charAt(0) ?? ""}`.toUpperCase();
	return s || "?";
}

export function UserAvatar({ className }: { className?: string }) {
	const { user } = useAuth();
	return (
		<span
			aria-hidden
			className={cn(
				"grid size-8 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-indigo-500 text-xs font-semibold text-white",
				className,
			)}
		>
			{user ? userInitials(user.first_name, user.last_name) : "…"}
		</span>
	);
}

const THEMES: { value: Theme; label: string; Icon: typeof LuSun }[] = [
	{ value: "light", label: "Light", Icon: LuSun },
	{ value: "dark", label: "Dark", Icon: LuMoon },
	{ value: "system", label: "System", Icon: LuMonitor },
];

type UserMenuProps = {
	/** "sidebar" opens upward with name + email in the trigger; "compact" is the avatar only. */
	variant: "sidebar" | "compact";
};

export function UserMenu({ variant }: UserMenuProps) {
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useDismiss(rootRef, open, close);

	const name = user
		? `${user.first_name} ${user.last_name}`.trim() || "Account"
		: "Account";

	async function handleLogout() {
		setOpen(false);
		await logout();
		navigate("/login");
	}

	return (
		<div
			ref={rootRef}
			className={cn("relative", variant === "sidebar" && "w-full")}
		>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				disabled={!user}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={variant === "compact" ? "Account menu" : undefined}
				className={cn(
					"flex cursor-pointer items-center gap-2.5 rounded-lg text-left transition-colors",
					variant === "sidebar"
						? "w-full p-1.5 hover:bg-surface-2"
						: "p-0.5",
				)}
			>
				<UserAvatar />
				{variant === "sidebar" ? (
					<span className="min-w-0 flex-1">
						<span className="block truncate text-sm font-medium">
							{name}
						</span>
						<span className="block truncate text-[11px] text-muted">
							{user?.email}
						</span>
					</span>
				) : null}
			</button>

			{open && user ? (
				<div
					role="menu"
					className={cn(
						popoverPanelClass,
						"absolute z-50 w-64",
						variant === "sidebar"
							? "bottom-full left-0 mb-2"
							: "top-full right-0 mt-2",
					)}
				>
					<div className="px-2.5 pt-2 pb-2.5">
						<p className="truncate text-sm font-medium">{name}</p>
						<p className="truncate text-xs text-muted">
							{user.email}
						</p>
					</div>
					<div className="border-t border-line px-2.5 py-2.5">
						<p className="mb-1.5 text-[11px] font-medium text-muted">
							Theme
						</p>
						<div className="flex rounded-lg bg-surface-2 p-0.5">
							{THEMES.map(({ value, label, Icon }) => (
								<button
									key={value}
									type="button"
									onClick={() => setTheme(value)}
									aria-pressed={theme === value}
									className={cn(
										"flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium transition",
										theme === value
											? "bg-surface text-fg shadow-sm"
											: "text-muted hover:text-fg",
									)}
								>
									<Icon className="size-3.5" />
									{label}
								</button>
							))}
						</div>
					</div>
					<div className="border-t border-line pt-1">
						<Link
							to="/settings/profile"
							role="menuitem"
							onClick={close}
							className={menuItemClass}
						>
							<LuSettings className="size-4 text-muted" />
							Settings
						</Link>
						<Link
							to="/contact"
							role="menuitem"
							onClick={close}
							className={menuItemClass}
						>
							<LuMessageCircle className="size-4 text-muted" />
							Contact us
						</Link>
						<Link
							to="/legal"
							role="menuitem"
							onClick={close}
							className={menuItemClass}
						>
							<LuScale className="size-4 text-muted" />
							Terms &amp; Privacy
						</Link>
					</div>
					<div className="mt-1 border-t border-line pt-1">
						<button
							type="button"
							role="menuitem"
							onClick={() => void handleLogout()}
							className={menuItemClass}
						>
							<LuLogOut className="size-4 text-muted" />
							Log out
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}

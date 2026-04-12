import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
	MdBrightnessAuto,
	MdCheck,
	MdDarkMode,
	MdExpandMore,
	MdLightMode,
	MdLogout,
	MdPersonOutline,
	MdSettings,
} from "react-icons/md";
import type { IconType } from "react-icons";

import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme/useTheme";
import type { Theme } from "@/contexts/theme/theme-context";
import { cn } from "@/lib/utils";

function userInitials(first: string, last: string): string {
	const a = first.trim().charAt(0);
	const b = last.trim().charAt(0);
	const s = `${a}${b}`.toUpperCase();
	return s.length > 0 ? s : "?";
}

const menuLinkClass =
	"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-primary transition-colors hover:bg-primary/5";

const THEME_OPTIONS: {
	value: Theme;
	label: string;
	Icon: IconType;
}[] = [
	{ value: "light", label: "Light", Icon: MdLightMode },
	{ value: "dark", label: "Dark", Icon: MdDarkMode },
	{ value: "system", label: "System", Icon: MdBrightnessAuto },
];

export function UserMenu() {
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [themePickerOpen, setThemePickerOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const themePickerRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const themePickerId = `${menuId}-theme-picker`;

	useEffect(() => {
		if (!open) setThemePickerOpen(false);
	}, [open]);

	useEffect(() => {
		if (!open) return;
		function onPointerDown(e: PointerEvent) {
			const t = e.target as Node;
			if (!rootRef.current?.contains(t)) {
				setOpen(false);
				setThemePickerOpen(false);
				return;
			}
			if (
				themePickerOpen &&
				themePickerRef.current &&
				!themePickerRef.current.contains(t)
			) {
				setThemePickerOpen(false);
			}
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				if (themePickerOpen) setThemePickerOpen(false);
				else setOpen(false);
			}
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open, themePickerOpen]);

	async function handleLogout() {
		setOpen(false);
		await logout();
		navigate("/login");
	}

	const displayName = user
		? `${user.first_name} ${user.last_name}`.trim() || "Account"
		: "Account";

	const themeTriggerIcon =
		theme === "system" ? (
			<MdBrightnessAuto className="h-5 w-5" />
		) : theme === "dark" ? (
			<MdDarkMode className="h-5 w-5" />
		) : (
			<MdLightMode className="h-5 w-5" />
		);

	const themeLabel =
		THEME_OPTIONS.find((o) => o.value === theme)?.label ?? "System";

	return (
		<div ref={rootRef} className="relative ml-1 shrink-0">
			<button
				type="button"
				id={`${menuId}-trigger`}
				aria-haspopup="true"
				aria-expanded={open}
				aria-controls={open ? `${menuId}-panel` : undefined}
				onClick={() => setOpen((v) => !v)}
				disabled={!user}
				className={cn(
					"flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-semibold text-white transition-opacity",
					!user && "cursor-not-allowed opacity-60",
				)}
				title={user ? displayName : undefined}
			>
				{user ? userInitials(user.first_name, user.last_name) : "…"}
			</button>

			{open && user ? (
				<div
					id={`${menuId}-panel`}
					role="menu"
					aria-labelledby={`${menuId}-trigger`}
					className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,18rem)] rounded-xl border border-primary/10 bg-background-secondary py-1 shadow-lg"
				>
					<div className="flex gap-3 px-4 py-3">
						<div
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
							aria-hidden
						>
							{userInitials(user.first_name, user.last_name)}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold text-text-primary">
								{displayName}
							</p>
							<p className="truncate text-sm text-text-secondary">
								{user.email}
							</p>
						</div>
					</div>

					<div className="border-t border-primary/10 px-4 py-3">
						<div className="flex items-center justify-between gap-3">
							<span className="text-sm text-text-secondary" id={themePickerId}>
								Theme
							</span>
							<div
								ref={themePickerRef}
								className={cn(
									"relative min-w-[8.5rem] max-w-[10rem] flex-1",
								)}
							>
								<button
									type="button"
									aria-haspopup="listbox"
									aria-expanded={themePickerOpen}
									aria-controls={
										themePickerOpen ? `${themePickerId}-list` : undefined
									}
									aria-labelledby={themePickerId}
									onClick={() => setThemePickerOpen((v) => !v)}
									className={cn(
										"relative flex h-9 w-full cursor-pointer items-center rounded-lg border border-primary/15 bg-tint py-1.5 pl-9 pr-8 text-left text-sm text-text-primary",
										"outline-none transition-[box-shadow,border-color]",
										"hover:border-primary/20",
										themePickerOpen &&
											"border-primary/25 ring-2 ring-primary/20",
									)}
								>
									<span
										className="pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-text-secondary"
										aria-hidden
									>
										{themeTriggerIcon}
									</span>
									<MdExpandMore
										className={cn(
											"pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary transition-transform",
											themePickerOpen && "rotate-180",
										)}
										aria-hidden
									/>
									<span className="block truncate pl-0.5">
										{themeLabel}
									</span>
								</button>
								{themePickerOpen ? (
									<ul
										id={`${themePickerId}-list`}
										role="listbox"
										aria-label="Theme"
										className={cn(
											"absolute right-0 top-full z-[60] mt-1 w-full overflow-hidden rounded-lg border border-primary/15 py-1 shadow-lg",
											"bg-background-secondary",
										)}
									>
										{THEME_OPTIONS.map(({ value, label, Icon }) => {
											const selected = theme === value;
											return (
												<li key={value} role="presentation">
													<button
														type="button"
														role="option"
														aria-selected={selected}
														onClick={() => {
															setTheme(value);
															setThemePickerOpen(false);
														}}
														className={cn(
															"flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
															"text-text-primary hover:bg-primary/10",
															selected && "bg-primary/15 font-medium",
														)}
													>
														<Icon
															className="h-5 w-5 shrink-0 text-text-secondary"
															aria-hidden
														/>
														<span className="min-w-0 flex-1 truncate">
															{label}
														</span>
														{selected ? (
															<MdCheck
																className="h-4 w-4 shrink-0 text-primary"
																aria-hidden
															/>
														) : (
															<span className="w-4 shrink-0" aria-hidden />
														)}
													</button>
												</li>
											);
										})}
									</ul>
								) : null}
							</div>
						</div>
					</div>

					<div className="border-t border-primary/10 px-2 py-2">
						<NavLink
							to="/profile"
							role="menuitem"
							onClick={() => setOpen(false)}
							className={({ isActive }) =>
								cn(menuLinkClass, isActive && "bg-primary/10")
							}
						>
							<MdPersonOutline className="h-5 w-5 shrink-0 text-text-secondary" />
							Your profile
						</NavLink>
						<NavLink
							to="/settings"
							role="menuitem"
							onClick={() => setOpen(false)}
							className={({ isActive }) =>
								cn(menuLinkClass, isActive && "bg-primary/10")
							}
						>
							<MdSettings className="h-5 w-5 shrink-0 text-text-secondary" />
							Settings
						</NavLink>
					</div>

					<div className="border-t border-primary/10 px-2 py-2">
						<button
							type="button"
							role="menuitem"
							onClick={() => void handleLogout()}
							className={menuLinkClass}
						>
							<MdLogout className="h-5 w-5 shrink-0 text-text-secondary" />
							Log out
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}

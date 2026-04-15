import { NavLink } from "react-router";
import {
	MdAssignment,
	MdAutoAwesome,
	MdCalendarToday,
	MdSpaceDashboard,
	MdDescription,
	MdFolder,
	MdSettings,
} from "react-icons/md";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";
import { FiExternalLink } from "react-icons/fi";

type NavItem = {
	to: string;
	label: string;
	icon: IconType;
	end?: boolean;
};

const navItems: NavItem[] = [
	{ to: "/", label: "Dashboard", icon: MdSpaceDashboard, end: true },
	{ to: "/projects", label: "Projects", icon: MdFolder },
	{ to: "/tasks", label: "Tasks", icon: MdAssignment },
	{ to: "/calendar", label: "Calendar", icon: MdCalendarToday },
	{ to: "/notes", label: "Notes", icon: MdDescription },
	{ to: "/habits", label: "Habits", icon: MdAutoAwesome },
	{ to: "/settings", label: "Settings", icon: MdSettings },
];

const year = new Date().getFullYear();

type SidebarProps = {
	mobileOpen: boolean;
	onNavigate: () => void;
};

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
	return (
		<aside
			id="app-sidebar-nav"
			className={cn(
				"flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-primary/10 bg-tint",
				"fixed left-0 top-14 z-[56] h-[calc(100dvh-3.5rem)] max-lg:w-[min(16rem,calc(100vw-1.25rem))] transition-transform duration-200 ease-out motion-reduce:transition-none",
				"max-lg:shadow-xl",
				mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
				!mobileOpen && "max-lg:pointer-events-none",
				"lg:static lg:top-auto lg:z-auto lg:h-auto lg:min-h-dvh lg:w-64 lg:translate-x-0 lg:shadow-none lg:pointer-events-auto",
			)}
		>
			<div className="flex items-center gap-2 px-4 pb-6 pt-4 sm:px-5">
				<img
					src="/layers.svg"
					alt=""
					width={32}
					height={32}
					className="size-8 shrink-0"
				/>
				<p className="text-lg font-bold tracking-tight text-text-primary pb-1">
					Trellix
				</p>
			</div>

			<nav className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4">
				{navItems.map(({ to, label, icon: Icon, end }) => (
					<NavLink
						key={to}
						to={to}
						end={end}
						onClick={onNavigate}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 border-r-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
								"text-text-secondary hover:bg-primary/5 hover:text-text-primary",
								isActive &&
									"border-primary bg-primary/10 text-text-primary",
							)
						}
					>
						<Icon className="h-5 w-5 shrink-0" aria-hidden />
						{label}
					</NavLink>
				))}
			</nav>

			<div className="mt-auto flex flex-col gap-2 border-t border-primary/10 p-4">
				<NavLink
					to="/contact"
					onClick={onNavigate}
					className={({ isActive }) =>
						cn(
							"flex items-center gap-1 rounded-lg px-2 py-2 text-sm transition-colors",
							"text-text-secondary hover:bg-primary/5 hover:text-text-primary",
							isActive && "bg-primary/10 text-text-primary",
						)
					}
				>
					<span className="text-xs">Contact us</span>
					<FiExternalLink className="inline-block" />
				</NavLink>
				<NavLink
					to="/legal"
					onClick={onNavigate}
					className="flex items-start gap-1 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-primary/5 hover:text-text-primary"
				>
					<span className="text-xs">
						Terms of use &amp; Privacy policy
					</span>
					<FiExternalLink className="inline-block" />
				</NavLink>
				<p className="px-2 pt-1 text-xs text-text-secondary">
					&copy; Trellix&trade; {year}
				</p>
			</div>
		</aside>
	);
}

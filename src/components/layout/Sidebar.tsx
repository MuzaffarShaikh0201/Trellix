import { NavLink } from "react-router";
import {
	MdCalendarToday,
	MdSpaceDashboard,
	MdDescription,
	MdFolder,
} from "react-icons/md";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

type NavItem = {
	to: string;
	label: string;
	icon: IconType;
	end?: boolean;
};

const navItems: NavItem[] = [
	{ to: "/", label: "Dashboard", icon: MdSpaceDashboard, end: true },
	{ to: "/projects", label: "Projects", icon: MdFolder },
	{ to: "/calendar", label: "Calendar", icon: MdCalendarToday },
	{ to: "/notes", label: "Notes", icon: MdDescription },
];

type SidebarProps = {
	open: boolean;
	onNavigate: () => void;
	onPointerEnter: () => void;
	onPointerLeave: () => void;
};

export function Sidebar({
	open,
	onNavigate,
	onPointerEnter,
	onPointerLeave,
}: SidebarProps) {
	return (
		<aside
			id="app-sidebar-nav"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			className={cn(
				"fixed left-0 top-0 z-[56] flex h-dvh w-[min(16rem,calc(100vw-1.25rem))] flex-col overflow-hidden border-r border-primary/10 bg-tint shadow-xl",
				"pt-[3.75rem] transition-transform duration-200 ease-out motion-reduce:transition-none",
				open ? "translate-x-0" : "-translate-x-full pointer-events-none",
			)}
		>
			<nav className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4 pt-2">
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
		</aside>
	);
}

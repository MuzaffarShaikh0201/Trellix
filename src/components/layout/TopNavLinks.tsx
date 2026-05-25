import { NavLink } from "react-router";

import { isDashboardRoute, mainNavItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"relative shrink-0 pb-0.5 text-sm font-medium transition-colors",
		isActive
			? "text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary after:content-['']"
			: "text-text-primary hover:text-primary",
	);

export function TopNavLinks() {
	return (
		<nav
			className="ml-6 hidden items-center gap-6 md:flex"
			aria-label="Main navigation"
		>
			{mainNavItems.map(({ to, label, end }) => (
				<NavLink
					key={to}
					to={to}
					end={end}
					replace={isDashboardRoute(to)}
					className={navLinkClass}
				>
					{label}
				</NavLink>
			))}
		</nav>
	);
}

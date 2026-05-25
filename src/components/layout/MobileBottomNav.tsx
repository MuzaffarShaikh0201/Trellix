import { NavLink } from "react-router";

import { isDashboardRoute, mainNavItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
	return (
		<nav
			className={cn(
				"fixed inset-x-0 bottom-0 z-50 md:hidden",
				"border-t border-primary/10 bg-background-secondary",
				"rounded-t-1xl shadow-[0_-4px_24px_rgba(15,23,42,0.08)]",
				"dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]",
				"pb-[max(0.5rem,env(safe-area-inset-bottom))]",
			)}
			aria-label="Main navigation"
		>
			<ul className="flex items-stretch justify-around px-2 pt-2">
				{mainNavItems.map(({ to, label, icon: Icon, end }) => (
					<li key={to} className="flex min-w-0 flex-1">
						<NavLink
							to={to}
							end={end}
							replace={isDashboardRoute(to)}
							className={({ isActive }) =>
								cn(
									"flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors",
									isActive
										? "text-primary"
										: "text-text-secondary hover:text-text-primary",
								)
							}
						>
							{({ isActive }) => (
								<>
									<Icon
										className={cn(
											"h-6 w-6 shrink-0",
											isActive && "drop-shadow-sm",
										)}
										aria-hidden
									/>
									<span
										className={cn(
											"max-w-full truncate text-[10px] font-medium leading-tight",
											isActive && "font-semibold",
										)}
									>
										{label}
									</span>
								</>
							)}
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}

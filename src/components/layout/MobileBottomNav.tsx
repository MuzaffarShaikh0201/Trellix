import { NavLink } from "react-router";
import { LuPlus } from "react-icons/lu";

import { isDashboardRoute, mainNavItems, type NavItem } from "@/components/layout/nav-items";
import { useShell } from "@/components/layout/shell-context";
import { cn } from "@/lib/utils";

function Item({ item }: { item: NavItem }) {
	const { to, shortLabel, icon: Icon, end } = item;
	return (
		<NavLink
			to={to}
			end={end}
			replace={isDashboardRoute(to)}
			className={({ isActive }) =>
				cn(
					"flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium",
					isActive ? "text-primary" : "text-muted",
				)
			}
		>
			<Icon className="size-5" aria-hidden />
			{shortLabel}
		</NavLink>
	);
}

export function MobileBottomNav() {
	const { openQuickAdd } = useShell();
	const [home, projects, calendar, notes] = mainNavItems;
	return (
		<nav
			aria-label="Main navigation"
			className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[max(.4rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
		>
			<div className="flex items-end px-2 pt-1">
				<Item item={home} />
				<Item item={projects} />
				<div className="flex flex-1 justify-center">
					<button
						type="button"
						onClick={openQuickAdd}
						aria-label="Create"
						className="-mt-5 grid size-12 cursor-pointer place-items-center rounded-2xl bg-primary text-white shadow-lg ring-4 shadow-primary/40 ring-bg transition active:scale-95"
					>
						<LuPlus className="size-6" />
					</button>
				</div>
				<Item item={notes} />
				<Item item={calendar} />
			</div>
		</nav>
	);
}

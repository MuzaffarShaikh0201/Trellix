import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router";
import { LuSearch, LuStar } from "react-icons/lu";

import { AppBrand } from "@/components/layout/AppBrand";
import { isDashboardRoute, mainNavItems } from "@/components/layout/nav-items";
import { useShell } from "@/components/layout/shell-context";
import { UserMenu } from "@/components/layout/UserMenu";
import { ProjectDot } from "@/components/project/ProjectTile";
import { fetchNotes } from "@/lib/api/notes";
import { noteKeys, useFavoriteProjects, useProjectStatusCounts } from "@/lib/queries";
import { cn } from "@/lib/utils";

function useNavCounts() {
	const { counts } = useProjectStatusCounts();
	const notes = useQuery({
		queryKey: [...noteKeys.all, "count"],
		queryFn: () => fetchNotes({ limit: 1 }),
		staleTime: 30_000,
	});
	return {
		"/projects": counts.ALL,
		"/notes": notes.data?.total_items,
	} as Record<string, number | undefined>;
}

export function Sidebar() {
	const { openPalette } = useShell();
	const counts = useNavCounts();
	const { data: favData } = useFavoriteProjects();
	const favorites = (favData?.projects ?? []).filter((p) => !p.is_archived);
	const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

	return (
		<aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
			<div className="flex h-14 shrink-0 items-center px-4">
				<AppBrand />
			</div>

			<div className="px-3">
				<button
					type="button"
					onClick={openPalette}
					className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-sm text-muted transition hover:border-primary/40"
				>
					<LuSearch className="size-4" />
					<span className="flex-1 text-left">Search…</span>
					<kbd className="rounded border border-line bg-surface px-1.5 font-mono text-[10px]">
						{isMac ? "⌘K" : "Ctrl K"}
					</kbd>
				</button>
			</div>

			<nav className="mt-4 space-y-0.5 px-3" aria-label="Main navigation">
				{mainNavItems.map(({ to, label, icon: Icon, end }) => (
					<NavLink
						key={to}
						to={to}
						end={end}
						replace={isDashboardRoute(to)}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
								isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-fg",
							)
						}
					>
						<Icon className="size-4" aria-hidden />
						<span className="flex-1">{label}</span>
						{counts[to] !== undefined ? (
							<span className="text-[11px] tabular-nums opacity-80">{counts[to]}</span>
						) : null}
					</NavLink>
				))}
			</nav>

			<div className="custom-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto px-3">
				<div className="flex items-center justify-between px-2.5 pb-1.5">
					<span className="text-[11px] font-semibold tracking-wider text-muted uppercase">Favorites</span>
					<LuStar className="size-3 text-muted" aria-hidden />
				</div>
				{favorites.length ? (
					<div className="space-y-0.5">
						{favorites.map((p) => (
							<NavLink
								key={p.id}
								to={`/projects/${p.id}`}
								className={({ isActive }) =>
									cn(
										"flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition",
										isActive ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
									)
								}
							>
								<ProjectDot project={p} />
								<span className="truncate">{p.title}</span>
							</NavLink>
						))}
					</div>
				) : (
					<p className="px-2.5 text-xs leading-relaxed text-muted">
						Star a project to pin it here.
					</p>
				)}
			</div>

			<div className="shrink-0 border-t border-line p-3">
				<UserMenu variant="sidebar" />
			</div>
		</aside>
	);
}

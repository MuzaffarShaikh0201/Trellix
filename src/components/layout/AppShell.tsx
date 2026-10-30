import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";

import { CommandPalette } from "@/components/layout/CommandPalette";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddSheet } from "@/components/layout/QuickAddSheet";
import { ShellContext } from "@/components/layout/shell-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopbar, Topbar } from "@/components/layout/Topbar";
import { CreateProjectModal } from "@/components/project/CreateProjectModal";
import { cn } from "@/lib/utils";

/** Full-screen editing routes hide the mobile bottom bar. */
function isEditorRoute(pathname: string) {
	return /^\/notes\/[^/]+$/.test(pathname);
}

export function AppShell() {
	const { pathname } = useLocation();
	const [slot, setSlot] = useState<HTMLElement | null>(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [quickAddOpen, setQuickAddOpen] = useState(false);

	const openCreateProject = useCallback(() => setCreateOpen(true), []);
	const openPalette = useCallback(() => setPaletteOpen(true), []);
	const openQuickAdd = useCallback(() => setQuickAddOpen(true), []);
	const closePalette = useCallback(() => setPaletteOpen(false), []);
	const closeQuickAdd = useCallback(() => setQuickAddOpen(false), []);
	const closeCreate = useCallback(() => setCreateOpen(false), []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((v) => !v);
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	const ctx = useMemo(
		() => ({ openCreateProject, openPalette, openQuickAdd, topbarSlot: slot }),
		[openCreateProject, openPalette, openQuickAdd, slot],
	);
	const editor = isEditorRoute(pathname);

	return (
		<ShellContext.Provider value={ctx}>
			<div className="flex h-dvh overflow-hidden bg-bg">
				<Sidebar />
				<div className="flex min-w-0 flex-1 flex-col">
					<Topbar setSlot={setSlot} />
					<MobileTopbar />
					<main
						id="main"
						className={cn(
							"custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto",
							!editor && "pb-24 md:pb-0",
						)}
					>
						<Outlet />
					</main>
				</div>
				{editor ? null : <MobileBottomNav />}
			</div>
			<CreateProjectModal open={createOpen} onClose={closeCreate} />
			<CommandPalette open={paletteOpen} onClose={closePalette} onCreateProject={openCreateProject} />
			<QuickAddSheet open={quickAddOpen} onClose={closeQuickAdd} onCreateProject={openCreateProject} />
		</ShellContext.Provider>
	);
}

/** Standard page width + padding. */
export function Page({
	children,
	className,
	width = "max-w-7xl",
}: {
	children: React.ReactNode;
	className?: string;
	width?: string;
}) {
	return <div className={cn("mx-auto w-full px-4 py-5 md:px-8 md:py-7", width, className)}>{children}</div>;
}

export function PageHeader({
	title,
	subtitle,
	eyebrow,
	actions,
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	eyebrow?: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-3">
			<div className="min-w-0">
				{eyebrow ? <p className="text-xs font-medium text-muted">{eyebrow}</p> : null}
				<h1 className={cn("text-2xl font-semibold tracking-tight", eyebrow && "mt-1")}>{title}</h1>
				{subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
			</div>
			{actions ? <div className="flex items-center gap-2 max-sm:hidden">{actions}</div> : null}
		</div>
	);
}

import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router";
import {
	LuArrowLeft,
	LuChevronDown,
	LuChevronRight,
	LuFilePlus,
	LuFolderPlus,
	LuPlus,
	LuSearch,
} from "react-icons/lu";

import { NotificationBell } from "@/components/layout/NotificationBell";
import { useShell } from "@/components/layout/shell-context";
import { UserMenu } from "@/components/layout/UserMenu";
import { BrandMark } from "@/components/layout/AppBrand";
import {
	buttonPrimaryClass,
	iconButtonClass,
	menuItemClass,
	popoverPanelClass,
} from "@/components/ui/buttonStyles";
import { useDismiss } from "@/hooks/useDismiss";
import { fetchNote } from "@/lib/api/notes";
import { noteKeys, useProject } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Crumb = { label: string; to?: string };

const SETTINGS_LABELS: Record<string, string> = {
	profile: "Profile",
	security: "Security",
	appearance: "Appearance",
};

/** Breadcrumbs derived from the URL, with titles read from the query cache. */
function useCrumbs(): { crumbs: Crumb[]; back?: string } {
	const { pathname } = useLocation();
	const parts = pathname.split("/").filter(Boolean);
	const projectId = parts[0] === "projects" ? parts[1] : undefined;
	const noteId = parts[0] === "notes" && parts[1] !== "new" ? parts[1] : undefined;

	const project = useProject(projectId);
	const note = useQuery({
		queryKey: noteKeys.detail(noteId ?? ""),
		queryFn: () => fetchNote(noteId!),
		enabled: Boolean(noteId),
	});

	switch (parts[0]) {
		case undefined:
			return { crumbs: [{ label: "Dashboard" }] };
		case "projects":
			return projectId
				? {
						crumbs: [{ label: "Projects", to: "/projects" }, { label: project.data?.title ?? "Project" }],
						back: "/projects",
					}
				: { crumbs: [{ label: "Projects" }] };
		case "notes":
			if (parts[1] === "new")
				return { crumbs: [{ label: "Notes", to: "/notes" }, { label: "New note" }], back: "/notes" };
			return noteId
				? {
						crumbs: [{ label: "Notes", to: "/notes" }, { label: note.data?.title || "Note" }],
						back: "/notes",
					}
				: { crumbs: [{ label: "Notes" }] };
		case "calendar":
			return { crumbs: [{ label: "Calendar" }] };
		case "settings":
			return {
				crumbs: [{ label: "Settings", to: "/settings/profile" }, { label: SETTINGS_LABELS[parts[1] ?? ""] ?? "Profile" }],
			};
		case "contact":
			return { crumbs: [{ label: "Contact us" }] };
		default:
			return { crumbs: [{ label: "Trellix" }] };
	}
}

function NewMenu() {
	const { openCreateProject } = useShell();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useDismiss(ref, open, close);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="menu"
				aria-expanded={open}
				className={buttonPrimaryClass("py-1.5")}
			>
				<LuPlus className="size-4" />
				New
				<LuChevronDown className="size-3.5 opacity-80" />
			</button>
			{open ? (
				<div role="menu" className={cn(popoverPanelClass, "absolute top-full right-0 z-40 mt-1.5 w-52")}>
					<button
						type="button"
						role="menuitem"
						className={menuItemClass}
						onClick={() => {
							close();
							openCreateProject();
						}}
					>
						<LuFolderPlus className="size-4 text-muted" />
						New project
					</button>
					<button
						type="button"
						role="menuitem"
						className={menuItemClass}
						onClick={() => {
							close();
							navigate("/notes/new");
						}}
					>
						<LuFilePlus className="size-4 text-muted" />
						New note
					</button>
				</div>
			) : null}
		</div>
	);
}

/** Desktop top bar: breadcrumbs, page actions slot, "New" menu. */
export function Topbar({ setSlot }: { setSlot: (el: HTMLElement | null) => void }) {
	const { crumbs } = useCrumbs();
	return (
		<header className="hidden h-14 shrink-0 items-center gap-3 relative z-40 border-b border-line bg-bg px-8 md:flex">
			<nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
				{crumbs.map((c, i) =>
					c.to && i < crumbs.length - 1 ? (
						<span key={c.label} className="flex items-center gap-1.5">
							<Link to={c.to} className="text-muted transition-colors hover:text-fg">
								{c.label}
							</Link>
							<LuChevronRight className="size-3.5 text-muted" aria-hidden />
						</span>
					) : (
						<span key={c.label} className="truncate font-medium" aria-current="page">
							{c.label}
						</span>
					),
				)}
			</nav>
			<div className="ml-auto flex items-center gap-1.5">
				<div ref={setSlot} className="flex items-center gap-1.5" />
				<NotificationBell />
				<NewMenu />
			</div>
		</header>
	);
}

/** Mobile top bar: back button or logo, title, search, account. */
export function MobileTopbar() {
	const { openPalette } = useShell();
	const { crumbs, back } = useCrumbs();
	const title = crumbs[crumbs.length - 1]?.label ?? "Trellix";
	return (
		<header className="flex h-14 shrink-0 items-center gap-2 relative z-40 border-b border-line bg-surface px-4 md:hidden">
			{back ? (
				<Link to={back} className={iconButtonClass("-ml-2")} aria-label="Back">
					<LuArrowLeft className="size-5" />
				</Link>
			) : (
				<BrandMark className="size-7" />
			)}
			<span className="truncate text-[15px] font-semibold">{title === "Dashboard" ? "Home" : title}</span>
			<div className="ml-auto flex items-center gap-1">
				<button type="button" onClick={openPalette} className={iconButtonClass()} aria-label="Search">
					<LuSearch className="size-5" />
				</button>
				<NotificationBell align="mobile" />
				<UserMenu variant="compact" />
			</div>
		</header>
	);
}

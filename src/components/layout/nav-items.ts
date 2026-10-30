import type { IconType } from "react-icons";
import {
	LuCalendarDays,
	LuFolderKanban,
	LuLayoutDashboard,
	LuNotebookPen,
} from "react-icons/lu";

export type NavItem = {
	to: string;
	label: string;
	/** Shorter label for the mobile bottom bar. */
	shortLabel: string;
	icon: IconType;
	end?: boolean;
};

export const DASHBOARD_PATH = "/";

export function isDashboardRoute(to: string): boolean {
	return to === DASHBOARD_PATH;
}

export const mainNavItems: NavItem[] = [
	{ to: DASHBOARD_PATH, label: "Dashboard", shortLabel: "Home", icon: LuLayoutDashboard, end: true },
	{ to: "/projects", label: "Projects", shortLabel: "Projects", icon: LuFolderKanban },
	{ to: "/calendar", label: "Calendar", shortLabel: "Calendar", icon: LuCalendarDays },
	{ to: "/notes", label: "Notes", shortLabel: "Notes", icon: LuNotebookPen },
];

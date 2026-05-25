import {
	MdCalendarToday,
	MdDescription,
	MdFolder,
	MdSpaceDashboard,
} from "react-icons/md";
import type { IconType } from "react-icons";

export type NavItem = {
	to: string;
	label: string;
	icon: IconType;
	end?: boolean;
};

export const DASHBOARD_PATH = "/";

export function isDashboardRoute(to: string): boolean {
	return to === DASHBOARD_PATH;
}

export const mainNavItems: NavItem[] = [
	{ to: DASHBOARD_PATH, label: "Dashboard", icon: MdSpaceDashboard, end: true },
	{ to: "/projects", label: "Projects", icon: MdFolder },
	{ to: "/calendar", label: "Calendar", icon: MdCalendarToday },
	{ to: "/notes", label: "Notes", icon: MdDescription },
];

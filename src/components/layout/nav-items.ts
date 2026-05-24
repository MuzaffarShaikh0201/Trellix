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

export const mainNavItems: NavItem[] = [
	{ to: "/", label: "Dashboard", icon: MdSpaceDashboard, end: true },
	{ to: "/projects", label: "Projects", icon: MdFolder },
	{ to: "/calendar", label: "Calendar", icon: MdCalendarToday },
	{ to: "/notes", label: "Notes", icon: MdDescription },
];

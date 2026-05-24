export type NavItem = {
	to: string;
	label: string;
	end?: boolean;
};

export const mainNavItems: NavItem[] = [
	{ to: "/", label: "Dashboard", end: true },
	{ to: "/projects", label: "Projects" },
	{ to: "/calendar", label: "Calendar" },
	{ to: "/notes", label: "Notes" },
];

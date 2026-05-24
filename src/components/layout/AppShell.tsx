import { Outlet } from "react-router";

import { AppFooter } from "@/components/layout/AppFooter";
import { TopNav } from "@/components/layout/TopNav";

export function AppShell() {
	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-background-primary">
			<TopNav />
			<main className="custom-scrollbar min-h-0 flex-1 overflow-auto p-4 sm:p-5 md:p-6">
				<Outlet />
			</main>
			<AppFooter />
		</div>
	);
}

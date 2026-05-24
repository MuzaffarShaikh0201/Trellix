import { Outlet } from "react-router";

import { AppFooter } from "@/components/layout/AppFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TopNav } from "@/components/layout/TopNav";

export function AppShell() {
	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-background-primary">
			<TopNav />
			<main className="flex min-h-0 flex-1 flex-col overflow-auto px-5 py-4 pb-20 sm:px-6 sm:py-5 sm:pb-20 md:px-8 md:py-6 md:pb-6">
				<Outlet />
			</main>
			<AppFooter />
			<MobileBottomNav />
		</div>
	);
}

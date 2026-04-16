import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

const LG_NAV_MEDIA = "(min-width: 1024px)";

export function AppShell() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
	const toggleMobileNav = useCallback(() => setMobileNavOpen((o) => !o), []);

	useEffect(() => {
		const mq = window.matchMedia(LG_NAV_MEDIA);
		function onChange() {
			if (mq.matches) setMobileNavOpen(false);
		}
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (!mobileNavOpen) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") closeMobileNav();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [mobileNavOpen, closeMobileNav]);

	useEffect(() => {
		if (!mobileNavOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [mobileNavOpen]);

	return (
		<>
			<div className="flex h-dvh overflow-hidden bg-background-primary">
				<Sidebar
					mobileOpen={mobileNavOpen}
					onNavigate={closeMobileNav}
				/>
				<div className="flex min-w-0 flex-1 flex-col lg:pl-64">
					<TopNav
						menuOpen={mobileNavOpen}
						onMenuToggle={toggleMobileNav}
					/>
					<main className="custom-scrollbar min-h-0 flex-1 overflow-auto p-4 sm:p-5 md:p-6">
						<Outlet />
					</main>
				</div>
			</div>
			{mobileNavOpen ? (
				<button
					type="button"
					className="fixed inset-x-0 bottom-0 top-14 z-[55] bg-black/45 backdrop-blur-[1px] lg:hidden"
					aria-label="Close navigation menu"
					onClick={closeMobileNav}
				/>
			) : null}
		</>
	);
}

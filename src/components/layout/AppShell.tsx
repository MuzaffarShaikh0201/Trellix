import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";

import { AppFooter } from "@/components/layout/AppFooter";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const NAV_CLOSE_DELAY_MS = 280;
/** Matches Tailwind `sm` — hover-open nav at this width and up only. */
const NAV_HOVER_MEDIA = "(min-width: 640px)";

export function AppShell() {
	const [navOpen, setNavOpen] = useState(false);
	const navHoverEnabled = useMediaQuery(NAV_HOVER_MEDIA);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearCloseTimer = useCallback(() => {
		if (closeTimerRef.current !== null) {
			clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
	}, []);

	const openNav = useCallback(() => {
		clearCloseTimer();
		setNavOpen(true);
	}, [clearCloseTimer]);

	const closeNav = useCallback(() => {
		clearCloseTimer();
		setNavOpen(false);
	}, [clearCloseTimer]);

	const scheduleCloseNav = useCallback(() => {
		clearCloseTimer();
		closeTimerRef.current = setTimeout(() => {
			setNavOpen(false);
			closeTimerRef.current = null;
		}, NAV_CLOSE_DELAY_MS);
	}, [clearCloseTimer]);

	const toggleNav = useCallback(() => {
		clearCloseTimer();
		setNavOpen((open) => !open);
	}, [clearCloseTimer]);

	const onMenuPointerEnter = useCallback(() => {
		if (navHoverEnabled) openNav();
	}, [navHoverEnabled, openNav]);

	const onMenuPointerLeave = useCallback(() => {
		if (navHoverEnabled) scheduleCloseNav();
	}, [navHoverEnabled, scheduleCloseNav]);

	useEffect(() => {
		return () => clearCloseTimer();
	}, [clearCloseTimer]);

	useEffect(() => {
		if (!navHoverEnabled) clearCloseTimer();
	}, [navHoverEnabled, clearCloseTimer]);

	useEffect(() => {
		if (!navOpen) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") closeNav();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [navOpen, closeNav]);

	useEffect(() => {
		if (!navOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [navOpen]);

	return (
		<>
			<div className="flex h-dvh flex-col overflow-hidden bg-background-primary">
				<TopNav
					menuOpen={navOpen}
					onMenuToggle={toggleNav}
					onMenuPointerEnter={onMenuPointerEnter}
					onMenuPointerLeave={onMenuPointerLeave}
				/>
				<Sidebar
					open={navOpen}
					onNavigate={closeNav}
					onPointerEnter={onMenuPointerEnter}
					onPointerLeave={onMenuPointerLeave}
				/>
				<main className="custom-scrollbar min-h-0 flex-1 overflow-auto p-4 sm:p-5 md:p-6">
					<Outlet />
				</main>
				<AppFooter />
			</div>
			{navOpen ? (
				<button
					type="button"
					className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[1px]"
					aria-label="Close navigation menu"
					onClick={closeNav}
				/>
			) : null}
		</>
	);
}

import { useEffect } from "react";

/** Clears back navigation from the dashboard — user cannot leave via browser back. */
export function useDashboardHistoryReset() {
	useEffect(() => {
		const url = () =>
			`${window.location.pathname}${window.location.search}${window.location.hash}`;

		const trapBack = () => {
			window.history.pushState(window.history.state, "", url());
		};

		window.history.replaceState(window.history.state, "", url());
		window.history.pushState(window.history.state, "", url());
		window.addEventListener("popstate", trapBack);

		return () => window.removeEventListener("popstate", trapBack);
	}, []);
}

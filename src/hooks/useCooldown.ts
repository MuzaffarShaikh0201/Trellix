import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/types/api";

/** "45s", "2:05", "14 min" */
export function formatWait(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 600) return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
	return `${Math.ceil(seconds / 60)} min`;
}

/**
 * Counts down after the API rate-limits an action, so its button can stay disabled.
 * `startFrom(err)` starts the countdown when `err` is a 429 and returns whether it did.
 */
export function useCooldown() {
	const [until, setUntil] = useState(0);
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (until === 0) return;
		const id = window.setInterval(() => {
			const t = Date.now();
			setNow(t);
			if (t >= until) {
				window.clearInterval(id);
				setUntil(0);
			}
		}, 1000);
		return () => window.clearInterval(id);
	}, [until]);

	const startFrom = useCallback((err: unknown): boolean => {
		if (!(err instanceof ApiError) || err.status !== 429) return false;
		const t = Date.now();
		setNow(t);
		// Without a known wait, hold the button briefly so it can't be hammered.
		setUntil(t + (err.retryAfter ?? 30) * 1000);
		return true;
	}, []);

	const secondsLeft = until === 0 ? 0 : Math.max(0, Math.ceil((until - now) / 1000));
	return { secondsLeft, waiting: secondsLeft > 0, startFrom };
}

type SessionExpiredNotifier = () => void;

let notifier: SessionExpiredNotifier | null = null;

/** Wired from {@link AuthProvider} so the API layer can react without importing React. */
export function setSessionExpiredNotifier(next: SessionExpiredNotifier | null) {
	notifier = next;
}

let notifyCoalesced = false;

/** Call after tokens are cleared due to failed refresh / persistent 401. Coalesces bursts from parallel requests. */
export function notifySessionExpired() {
	if (!notifier || notifyCoalesced) return;
	notifyCoalesced = true;
	queueMicrotask(() => {
		notifyCoalesced = false;
		notifier?.();
	});
}

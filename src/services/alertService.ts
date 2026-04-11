export type AlertType = "success" | "error" | "warning" | "info";

export type AlertPayload = {
	title: string;
	type: AlertType;
	description: string;
};

export type QueuedAlert = AlertPayload & { id: string };

type AlertHandler = (payload: AlertPayload) => void;

let handler: AlertHandler | null = null;

/** Called once from {@link AlertHost} to wire imperative alerts into the UI. */
export function setAlertHandler(next: AlertHandler | null) {
	handler = next;
}

/**
 * Show a toast-style alert (requires {@link AlertHost} mounted under a provider).
 * New alerts appear at the bottom; existing alerts shift up.
 */
export function showAlert(
	title: string,
	type: AlertType,
	description: string,
) {
	if (!handler) {
		console.warn("showAlert: no alert handler registered");
		return;
	}
	handler({ title, type, description });
}

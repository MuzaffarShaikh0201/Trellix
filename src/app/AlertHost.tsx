import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import CustomAlert from "@/components/ui/CustomAlert";
import {
	setAlertHandler,
	type AlertPayload,
	type QueuedAlert,
} from "@/services/alertService";

function createId() {
	return crypto.randomUUID();
}

export function AlertHost() {
	const [alerts, setAlerts] = useState<QueuedAlert[]>([]);

	const pushAlert = useCallback((payload: AlertPayload) => {
		setAlerts((prev) => [...prev, { ...payload, id: createId() }]);
	}, []);

	const removeAlert = useCallback((id: string) => {
		setAlerts((prev) => prev.filter((a) => a.id !== id));
	}, []);

	useEffect(() => {
		setAlertHandler(pushAlert);
		return () => setAlertHandler(null);
	}, [pushAlert]);

	if (alerts.length === 0) return null;

	return (
		<div
			className="pointer-events-none fixed right-6 bottom-6 z-100 flex w-[min(100vw-3rem,24rem)] flex-col gap-3"
			aria-live="polite"
			aria-relevant="additions"
		>
			<AnimatePresence initial={false} mode="popLayout">
				{alerts.map((alert) => (
					<motion.div
						key={alert.id}
						layout="position"
						initial={{ y: -28, opacity: 0, scale: 0.94 }}
						animate={{ y: 0, opacity: 1, scale: 1 }}
						exit={{ y: 28, opacity: 0, scale: 0.94 }}
						transition={{
							type: "spring",
							stiffness: 420,
							damping: 32,
							mass: 0.85,
						}}
						className="pointer-events-auto w-full shrink-0"
					>
						<CustomAlert
							stacked
							type={alert.type}
							title={alert.title}
							description={alert.description}
							onClose={() => removeAlert(alert.id)}
						/>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

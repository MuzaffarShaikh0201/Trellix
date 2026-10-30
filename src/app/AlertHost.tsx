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
			className="pointer-events-none fixed inset-x-3 bottom-24 z-100 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
			aria-live="polite"
			aria-relevant="additions"
		>
			<AnimatePresence initial={false} mode="popLayout">
				{alerts.map((alert) => (
					<motion.div
						key={alert.id}
						layout="position"
						initial={{ y: 16, opacity: 0, scale: 0.96 }}
						animate={{ y: 0, opacity: 1, scale: 1 }}
						exit={{ x: 24, opacity: 0, scale: 0.96 }}
						transition={{
							type: "spring",
							stiffness: 420,
							damping: 32,
							mass: 0.85,
						}}
						className="pointer-events-auto w-full shrink-0"
					>
						<CustomAlert
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

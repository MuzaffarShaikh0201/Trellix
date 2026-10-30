import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { LuBell, LuBellRing, LuCheckCheck, LuCircleCheck, LuClock, LuTriangleAlert } from "react-icons/lu";

import { iconButtonClass, popoverPanelClass } from "@/components/ui/buttonStyles";
import { Skeleton } from "@/components/ui/Card";
import { useDismiss } from "@/hooks/useDismiss";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/activity";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { timeAgo } from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type { AppNotification, GetNotificationsResponse } from "@/types/activity";

const KEY = ["notifications"] as const;

const isOverdue = (n: AppNotification) => n.type === "OVERDUE" || n.type === "TASK_OVERDUE";

/** Task notifications open the task on its project's board. */
function notificationHref(n: AppNotification) {
	return n.task ? `/projects/${n.project.id}?tab=tasks&task=${n.task.id}` : `/projects/${n.project.id}`;
}

export function NotificationBell({ align = "right" }: { align?: "right" | "mobile" }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useDismiss(ref, open, close);

	// The server creates deadline notifications when this list is requested, so poll gently.
	const { data, isPending } = useQuery({
		queryKey: KEY,
		queryFn: () => fetchNotifications({ limit: 20 }),
		refetchInterval: 5 * 60_000,
	});
	const unread = data?.unread_count ?? 0;

	const markRead = useMutation({
		// "all" uses the single read-all endpoint, which also covers notifications not loaded here.
		mutationFn: async (ids: string[] | "all"): Promise<void> => {
			if (ids === "all") await markAllNotificationsRead();
			else await Promise.all(ids.map(markNotificationRead));
		},
		onMutate: async (target) => {
			const ids = target === "all" ? null : target;
			const hit = (n: AppNotification) => ids === null || ids.includes(n.id);
			await qc.cancelQueries({ queryKey: KEY });
			const previous = qc.getQueryData<GetNotificationsResponse>(KEY);
			const now = new Date().toISOString();
			qc.setQueryData<GetNotificationsResponse>(KEY, (d) =>
				d
					? {
							...d,
							unread_count: ids === null ? 0 : Math.max(0, d.unread_count - d.notifications.filter((n) => hit(n) && !n.is_read).length),
							notifications: d.notifications.map((n) => (hit(n) && !n.is_read ? { ...n, is_read: true, read_at: now } : n)),
						}
					: d,
			);
			return { previous };
		},
		onError: (err, _ids, ctx) => {
			if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
			showAlert("Could not update notifications", "error", getRequestErrorMessage(err, "Please try again."));
		},
		onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
	});

	function openItem(n: AppNotification) {
		if (!n.is_read) markRead.mutate([n.id]);
		close();
		navigate(notificationHref(n));
	}

	const items = data?.notifications ?? [];

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
				className={iconButtonClass("relative")}
			>
				{unread ? <LuBellRing className="size-[18px]" /> : <LuBell className="size-[18px]" />}
				{unread ? (
					<span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] leading-4 font-semibold text-white ring-2 ring-bg">
						{unread > 9 ? "9+" : unread}
					</span>
				) : null}
			</button>

			{open ? (
				<div
					role="dialog"
					aria-label="Notifications"
					className={cn(
						popoverPanelClass,
						"absolute top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] p-0",
						align === "mobile" ? "-right-12" : "right-0",
					)}
				>
					<div className="flex items-center justify-between border-b border-line px-4 py-2.5">
						<p className="text-sm font-semibold">Notifications</p>
						{unread ? (
							<button
								type="button"
								onClick={() => markRead.mutate("all")}
								className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
							>
								<LuCheckCheck className="size-3.5" />
								Mark all read
							</button>
						) : null}
					</div>
					<div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-1">
						{isPending ? (
							<div className="space-y-3 p-3">
								<Skeleton className="h-10" />
								<Skeleton className="h-10" />
							</div>
						) : items.length === 0 ? (
							<div className="px-4 py-10 text-center">
								<LuBell className="mx-auto size-6 text-muted" />
								<p className="mt-2 text-sm font-medium">You’re all caught up</p>
								<p className="mt-0.5 text-xs text-muted">Deadline reminders for your projects and tasks show up here.</p>
							</div>
						) : (
							items.map((n) => {
								const overdue = isOverdue(n);
								return (
									<button
										key={n.id}
										type="button"
										onClick={() => openItem(n)}
										className={cn(
											"flex w-full cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-2",
											!n.is_read && "bg-primary/5",
										)}
									>
										<span
											className={cn(
												"mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
												overdue
													? "bg-red-500/10 text-red-600 dark:text-red-400"
													: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
											)}
										>
											{overdue ? <LuTriangleAlert className="size-3.5" /> : <LuClock className="size-3.5" />}
										</span>
										<span className="min-w-0 flex-1">
											<span className={cn("block text-sm", !n.is_read && "font-medium")}>{n.message}</span>
											<span className="flex items-center gap-1 text-[11px] text-muted">
												{n.task ? <LuCircleCheck className="size-3" aria-hidden /> : null}
												{n.task ? "Task" : "Project"} · {overdue ? "Overdue" : "Due soon"} · {timeAgo(n.created_at)}
											</span>
										</span>
										{!n.is_read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
									</button>
								);
							})
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}

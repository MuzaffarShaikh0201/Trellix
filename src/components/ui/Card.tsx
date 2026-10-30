import type { ReactNode } from "react";
import { LuTriangleAlert } from "react-icons/lu";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const cardClass = "rounded-xl border border-line bg-surface";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
	return <section className={cn(cardClass, className)}>{children}</section>;
}

export function CardHeader({
	title,
	icon,
	action,
	className,
}: {
	title: ReactNode;
	icon?: ReactNode;
	action?: ReactNode;
	className?: string;
}) {
	return (
		<header className={cn("flex items-center justify-between gap-3 border-b border-line px-4 py-3", className)}>
			<h2 className="flex items-center gap-1.5 text-sm font-semibold">
				{icon ? <span className="text-muted [&>svg]:size-3.5">{icon}</span> : null}
				{title}
			</h2>
			{action}
		</header>
	);
}

export function Skeleton({ className }: { className?: string }) {
	return <div aria-hidden className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: {
	icon: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	action?: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("grid place-items-center px-6 py-14 text-center", className)}>
			<span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary [&>svg]:size-6">
				{icon}
			</span>
			<p className="mt-4 font-semibold">{title}</p>
			{description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
			{action ? <div className="mt-4">{action}</div> : null}
		</div>
	);
}

export function ErrorState({
	title,
	message,
	onRetry,
	retrying,
	className,
}: {
	title: string;
	message: string;
	onRetry?: () => void;
	retrying?: boolean;
	className?: string;
}) {
	return (
		<div className={cn("rounded-xl border border-red-500/30 bg-red-500/5 p-4", className)} role="alert">
			<p className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
				<LuTriangleAlert className="size-4" />
				{title}
			</p>
			<p className="mt-1 text-sm text-muted">{message}</p>
			{onRetry ? (
				<Button variant="secondary" className="mt-3" onClick={onRetry} loading={retrying}>
					Try again
				</Button>
			) : null}
		</div>
	);
}

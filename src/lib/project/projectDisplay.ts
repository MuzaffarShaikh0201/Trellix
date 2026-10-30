import type { Project, ProjectStatus } from "@/types/project";

export const PROJECT_COLOR_SWATCHES = [
	"#3b82f6",
	"#10b981",
	"#06b6d4",
	"#8b5cf6",
	"#ec4899",
	"#f59e0b",
	"#f97316",
	"#ef4444",
	"#64748b",
] as const;

/** Stored color, or a stable swatch derived from the id for projects without one. */
export function projectColor(project: { id: string; color?: string | null }): string {
	if (project.color && /^#[0-9a-f]{3,8}$/i.test(project.color)) return project.color;
	let hash = 0;
	for (const ch of project.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
	return PROJECT_COLOR_SWATCHES[hash % PROJECT_COLOR_SWATCHES.length];
}

export function projectInitials(title: string): string {
	const words = title.trim().split(/\s+/).filter(Boolean);
	const letters = words.slice(0, 2).map((w) => w[0]).join("");
	return letters.toUpperCase() || "?";
}

const DAY_MS = 86_400_000;

/** Parses a YYYY-MM-DD (or ISO) date as local noon so day math ignores time zones. */
export function parseDay(value: string | null | undefined): Date | null {
	if (!value) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function today(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

/** A local date as YYYY-MM-DD. */
export function toDayValue(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today as YYYY-MM-DD in local time (for date input values). */
export function todayInputValue(): string {
	return toDayValue(today());
}

export function daysUntil(value: string | null | undefined): number | null {
	const d = parseDay(value);
	return d ? Math.round((d.getTime() - today().getTime()) / DAY_MS) : null;
}

/** How far through its start → end window a project is, 0–100. */
export function timelinePercent(
	project: Pick<Project, "start_date" | "end_date" | "status">,
): number {
	if (project.status === "COMPLETED") return 100;
	const start = parseDay(project.start_date);
	const end = parseDay(project.end_date);
	if (!start || !end || end <= start) return 0;
	const pct = ((today().getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
	return Math.max(0, Math.min(100, Math.round(pct)));
}

export type DueInfo = { label: string; tone: "muted" | "warn" | "danger" | "done" };

export function dueInfo(project: { status: ProjectStatus; end_date: string | null }): DueInfo {
	if (project.status === "COMPLETED") return { label: "Completed", tone: "done" };
	if (project.status === "ABANDONED") return { label: "Abandoned", tone: "muted" };
	const d = daysUntil(project.end_date);
	if (d === null) return { label: "No deadline", tone: "muted" };
	if (d < 0) return { label: `${-d}d overdue`, tone: "danger" };
	if (d === 0) return { label: "Due today", tone: "warn" };
	return { label: `${d}d left`, tone: d <= 14 ? "warn" : "muted" };
}

export const DUE_TONE_CLASS: Record<DueInfo["tone"], string> = {
	muted: "text-muted",
	warn: "text-amber-600 dark:text-amber-400",
	danger: "text-red-600 dark:text-red-400",
	done: "text-emerald-600 dark:text-emerald-400",
};

export function formatDay(
	value: string | null | undefined,
	withYear = false,
): string {
	const d = parseDay(value);
	if (!d) return "—";
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		...(withYear ? { year: "numeric" } : {}),
	});
}

/** "2h ago", "Yesterday", "Mar 4" style relative time. */
export function timeAgo(value: string | null | undefined): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	const s = Math.round((Date.now() - d.getTime()) / 1000);
	if (s < 45) return "just now";
	const m = Math.round(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h}h ago`;
	const days = Math.round(h / 24);
	if (days === 1) return "Yesterday";
	if (days < 7) return `${days}d ago`;
	if (days < 30) return `${Math.round(days / 7)}w ago`;
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		...(d.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
	});
}

/** "owner/repo" from a GitHub-style URL. */
export function repoDisplayName(url: string | null | undefined): string | null {
	if (!url?.trim()) return null;
	try {
		const parsed = new URL(url.includes("://") ? url : `https://${url}`);
		const parts = parsed.pathname.split("/").filter(Boolean);
		if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
		if (parts.length === 1) return parts[0];
		return parsed.hostname.replace(/^www\./, "");
	} catch {
		return url.trim();
	}
}

/** "31 Oct, 14:05" style date and time in the user's locale. */
export function formatDateTime(value: string | null | undefined): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

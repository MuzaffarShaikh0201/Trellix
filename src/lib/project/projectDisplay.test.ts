import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	daysUntil,
	dueInfo,
	parseDay,
	projectColor,
	projectInitials,
	repoDisplayName,
	timeAgo,
	timelinePercent,
	todayInputValue,
	PROJECT_COLOR_SWATCHES,
} from "@/lib/project/projectDisplay";

// Freeze "now" at Oct 29, 2026, 15:00 local time.
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 9, 29, 15, 0, 0));
});
afterEach(() => vi.useRealTimers());

describe("parseDay", () => {
	it("reads YYYY-MM-DD as a local date (no time-zone shift)", () => {
		const d = parseDay("2026-12-15")!;
		expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 11, 15]);
	});
	it("returns null for empty or invalid input", () => {
		expect(parseDay(null)).toBeNull();
		expect(parseDay("")).toBeNull();
		expect(parseDay("not a date")).toBeNull();
	});
});

describe("daysUntil / todayInputValue", () => {
	it("counts whole days from today", () => {
		expect(daysUntil("2026-10-29")).toBe(0);
		expect(daysUntil("2026-11-05")).toBe(7);
		expect(daysUntil("2026-10-20")).toBe(-9);
		expect(daysUntil(null)).toBeNull();
	});
	it("formats today for date inputs", () => {
		expect(todayInputValue()).toBe("2026-10-29");
	});
});

describe("timelinePercent", () => {
	const base = { status: "IN_PROGRESS" as const };
	it("is the share of the start→end window that has passed", () => {
		expect(timelinePercent({ ...base, start_date: "2026-10-19", end_date: "2026-11-08" })).toBe(50);
	});
	it("clamps to 0–100", () => {
		expect(timelinePercent({ ...base, start_date: "2026-11-01", end_date: "2026-12-01" })).toBe(0);
		expect(timelinePercent({ ...base, start_date: "2026-01-01", end_date: "2026-02-01" })).toBe(100);
	});
	it("is 100 for completed projects and 0 without a full range", () => {
		expect(timelinePercent({ status: "COMPLETED", start_date: null, end_date: null })).toBe(100);
		expect(timelinePercent({ ...base, start_date: "2026-10-01", end_date: null })).toBe(0);
	});
});

describe("dueInfo", () => {
	it("labels by status first", () => {
		expect(dueInfo({ status: "COMPLETED", end_date: "2026-01-01" })).toEqual({ label: "Completed", tone: "done" });
		expect(dueInfo({ status: "ABANDONED", end_date: null }).label).toBe("Abandoned");
	});
	it("shows overdue, due today, and days left with the right tone", () => {
		expect(dueInfo({ status: "IN_PROGRESS", end_date: "2026-10-27" })).toEqual({ label: "2d overdue", tone: "danger" });
		expect(dueInfo({ status: "IN_PROGRESS", end_date: "2026-10-29" })).toEqual({ label: "Due today", tone: "warn" });
		expect(dueInfo({ status: "IN_PROGRESS", end_date: "2026-11-05" })).toEqual({ label: "7d left", tone: "warn" });
		expect(dueInfo({ status: "PLANNING", end_date: "2026-12-29" })).toEqual({ label: "61d left", tone: "muted" });
		expect(dueInfo({ status: "PLANNING", end_date: null }).label).toBe("No deadline");
	});
});

describe("projectColor", () => {
	it("uses the stored color when valid", () => {
		expect(projectColor({ id: "a", color: "#ec4899" })).toBe("#ec4899");
	});
	it("falls back to a stable swatch derived from the id", () => {
		const c = projectColor({ id: "6e330548-522a", color: null });
		expect(PROJECT_COLOR_SWATCHES).toContain(c);
		expect(projectColor({ id: "6e330548-522a", color: "not-a-color" })).toBe(c);
	});
});

describe("text helpers", () => {
	it("builds initials from up to two words", () => {
		expect(projectInitials("Trellix Web App")).toBe("TW");
		expect(projectInitials("api")).toBe("A");
		expect(projectInitials("   ")).toBe("?");
	});
	it("shortens repository URLs to owner/repo", () => {
		expect(repoDisplayName("https://github.com/example/trellix")).toBe("example/trellix");
		expect(repoDisplayName("github.com/example/trellix/tree/main")).toBe("example/trellix");
		expect(repoDisplayName("")).toBeNull();
	});
	it("formats relative times", () => {
		const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
		expect(timeAgo(ago(10_000))).toBe("just now");
		expect(timeAgo(ago(5 * 60_000))).toBe("5m ago");
		expect(timeAgo(ago(3 * 3_600_000))).toBe("3h ago");
		expect(timeAgo(ago(30 * 3_600_000))).toBe("Yesterday");
		expect(timeAgo(ago(3 * 86_400_000))).toBe("3d ago");
		expect(timeAgo(null)).toBe("—");
	});
});

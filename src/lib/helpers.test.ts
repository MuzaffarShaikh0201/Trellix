import { describe, expect, it, vi } from "vitest";

import { safeAppRedirectTarget } from "@/lib/auth/auth-routes";
import { noteSnippet, wordCount } from "@/lib/note/noteDisplay";
import { pageInfo } from "@/lib/pagination";
import { MAX_PAGES, fetchAllPages } from "@/lib/queries";

describe("noteSnippet", () => {
	it("strips markdown syntax into plain text", () => {
		const md = "# Title\n\n- [x] **Bold** item\n> quote with [a link](https://x.dev)\n\n```ts\ncode();\n```";
		expect(noteSnippet(md)).toBe("Title Bold item quote with a link");
	});
	it("truncates and handles empty input", () => {
		expect(noteSnippet("a".repeat(500), 10)).toHaveLength(10);
		expect(noteSnippet(null)).toBe("");
		expect(noteSnippet(undefined)).toBe("");
	});
	it("counts words", () => {
		expect(wordCount("  one two\nthree ")).toBe(3);
		expect(wordCount("")).toBe(0);
	});
});

describe("pageInfo", () => {
	it("computes the visible range", () => {
		expect(pageInfo(2, 12, 30, 3)).toEqual({
			current: 2,
			pages: 3,
			startItem: 13,
			endItem: 24,
			canGoPrev: true,
			canGoNext: true,
		});
	});
	it("clamps a page past the end and handles empty results", () => {
		expect(pageInfo(9, 12, 30, 3)).toMatchObject({ current: 3, startItem: 25, endItem: 30, canGoNext: false });
		expect(pageInfo(1, 12, 0, 0)).toMatchObject({ pages: 1, startItem: 0, endItem: 0, canGoPrev: false, canGoNext: false });
	});
});

describe("fetchAllPages", () => {
	const page = (n: number, totalPages: number) => ({
		items: [`item-${n}`],
		total_pages: totalPages,
		total_items: totalPages,
		current_page: n,
		items_per_page: 1,
	});

	it("merges every page in order", async () => {
		const fetchPage = vi.fn((n: number) => Promise.resolve(page(n, 3)));
		const result = await fetchAllPages(fetchPage, "items");
		expect(result.items).toEqual(["item-1", "item-2", "item-3"]);
		expect(result.truncated).toBe(false);
		expect(fetchPage).toHaveBeenCalledTimes(3);
	});

	it("stops at MAX_PAGES and reports truncation", async () => {
		const fetchPage = vi.fn((n: number) => Promise.resolve(page(n, MAX_PAGES + 5)));
		const result = await fetchAllPages(fetchPage, "items");
		expect(result.items).toHaveLength(MAX_PAGES);
		expect(result.truncated).toBe(true);
	});
});

describe("safeAppRedirectTarget", () => {
	it("allows in-app paths", () => {
		expect(safeAppRedirectTarget("/projects/123")).toBe("/projects/123");
		expect(safeAppRedirectTarget(encodeURIComponent("/notes?tab=personal"))).toBe("/notes?tab=personal");
	});
	it("blocks open redirects and auth loops", () => {
		expect(safeAppRedirectTarget("https://evil.example")).toBe("/");
		expect(safeAppRedirectTarget("//evil.example")).toBe("/");
		expect(safeAppRedirectTarget("/login")).toBe("/");
		expect(safeAppRedirectTarget(null)).toBe("/");
	});
});

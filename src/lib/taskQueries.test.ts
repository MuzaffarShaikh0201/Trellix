import { describe, expect, it } from "vitest";

import { notePreview } from "@/lib/note/noteDisplay";
import { applyMove, groupTasks } from "@/lib/taskQueries";
import type { Task, TaskStatus } from "@/types/task";

function task(id: string, status: TaskStatus, position: number): Task {
	return {
		id,
		project_id: "p",
		user_id: "u",
		title: id,
		description: null,
		status,
		priority: "MEDIUM",
		due_date: null,
		position,
		completed_at: status === "DONE" ? "2026-10-01T00:00:00Z" : null,
		created_at: "2026-10-01T00:00:00Z",
		updated_at: "2026-10-01T00:00:00Z",
	};
}

const board = [task("a", "TODO", 0), task("b", "TODO", 1), task("c", "TODO", 2), task("d", "DONE", 0)];
const ids = (tasks: Task[], s: TaskStatus) => groupTasks(tasks)[s].map((t) => `${t.id}${t.position}`);

describe("applyMove (mirrors PATCH /task/{id}/move)", () => {
	it("reorders within a column and renumbers from 0", () => {
		const next = applyMove(board, "a", "TODO", 2);
		expect(ids(next, "TODO")).toEqual(["b0", "c1", "a2"]);
	});

	it("moves across columns and closes the gap in the old one", () => {
		const next = applyMove(board, "b", "DONE", 0);
		expect(ids(next, "TODO")).toEqual(["a0", "c1"]);
		expect(ids(next, "DONE")).toEqual(["b0", "d1"]);
	});

	it("puts a position past the end last", () => {
		expect(ids(applyMove(board, "a", "IN_PROGRESS", 99), "IN_PROGRESS")).toEqual(["a0"]);
	});

	it("sets completed_at entering DONE, clears it leaving, keeps it when reordering inside DONE", () => {
		const done = applyMove(board, "a", "DONE", 0).find((t) => t.id === "a")!;
		expect(done.completed_at).not.toBeNull();
		const back = applyMove(board, "d", "TODO", 0).find((t) => t.id === "d")!;
		expect(back.completed_at).toBeNull();
		const reordered = applyMove(board, "d", "DONE", 0).find((t) => t.id === "d")!;
		expect(reordered.completed_at).toBe("2026-10-01T00:00:00Z");
	});

	it("ignores unknown ids", () => {
		expect(applyMove(board, "zzz", "DONE", 0)).toBe(board);
	});
});

describe("notePreview", () => {
	it("prefers the server excerpt, falling back to content", () => {
		expect(notePreview({ excerpt: "From server", content: "# Ignored" })).toBe("From server");
		expect(notePreview({ excerpt: null, content: "**Local** text" })).toBe("Local text");
		expect(notePreview({ excerpt: null, content: undefined })).toBe("");
	});
});

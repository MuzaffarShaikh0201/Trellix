import { expect, test } from "@playwright/test";

import { api, createAccount, signIn, type Session } from "./helpers";

let session: Session;

test.beforeAll(async ({ request }) => {
	session = await createAccount(request, "app");
});

test.beforeEach(async ({ page }) => {
	await signIn(page, session);
});

test("create a project from the New menu and land on it", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "New", exact: true }).click();
	await page.getByRole("menuitem", { name: "New project" }).click();
	await page.getByLabel("Project title").fill("E2E Launch");
	await page.getByRole("button", { name: "Create project" }).click();

	await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
	await expect(page.getByRole("heading", { name: "E2E Launch" })).toBeVisible();
});

test("tasks: add, complete, and see progress", async ({ page, request }) => {
	const { project_id } = await api<{ project_id: string }>(request, session, "POST", "/project", { title: "Task board" });
	await page.goto(`/projects/${project_id}?tab=tasks`);

	await page.getByRole("button", { name: "Add the first task" }).click();
	const input = page.getByLabel("New task title");
	await input.fill("Write tests");
	await input.press("Enter");
	await input.fill("Ship it");
	await input.press("Enter");
	await expect(page.getByRole("button", { name: "Ship it" })).toBeVisible();

	await page.getByRole("button", { name: "Mark “Write tests” as done" }).click();
	await expect(page.getByText("1 of 2 done")).toBeVisible();

	const { tasks } = await api<{ tasks: { title: string; status: string }[] }>(request, session, "GET", `/project/${project_id}/task`);
	expect(tasks.find((t) => t.title === "Write tests")?.status).toBe("DONE");
});

test("notes: create, then edits autosave", async ({ page, request }) => {
	await page.goto("/notes/new");
	await page.getByLabel("Note title").fill("E2E note");
	await page.locator("#note-content").fill("First line");
	await page.getByRole("button", { name: "Create note" }).first().click();
	await expect(page).toHaveURL(/\/notes\/[\w-]+$/);

	const noteId = page.url().split("/").pop()!;
	await page.locator("#note-content").fill("First line\n\nEdited by the e2e test");
	await expect(page.getByText(/Saved ·/).first()).toBeVisible({ timeout: 10_000 });

	const note = await api<{ content: string }>(request, session, "GET", `/note/${noteId}`);
	expect(note.content).toContain("Edited by the e2e test");
});

test("calendar: picking a date shows what's on it", async ({ page, request }) => {
	const d = new Date();
	d.setDate(d.getDate() + 3);
	const due = d.toISOString().slice(0, 10);
	const { project_id } = await api<{ project_id: string }>(request, session, "POST", "/project", {
		title: "Calendar check",
		end_date: due,
	});
	const { task_id } = await api<{ task_id: string }>(request, session, "POST", `/project/${project_id}/task`, {
		title: "Calendar task",
		due_date: due,
	});

	await page.goto("/calendar");
	if (d.getMonth() !== new Date().getMonth()) await page.getByRole("button", { name: "Next month" }).click();
	const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
	await page.getByRole("button", { name: label, exact: true }).first().click();

	const panel = page.locator("section[aria-live]").filter({ visible: true }).first();
	await expect(panel.getByRole("heading", { name: label })).toBeVisible();
	await expect(panel.getByText("Calendar check")).toBeVisible();

	// Tasks due that day are listed and open on their project's board.
	await panel.getByRole("link", { name: /Calendar task/ }).click();
	await expect(page).toHaveURL(new RegExp(`/projects/${project_id}\\?tab=tasks&task=${task_id}`));
	await expect(page.getByRole("dialog")).toBeVisible();
	await page.goBack();

	await page.getByRole("button", { name: "Today", exact: true }).click();
	await expect(panel.getByText("Today", { exact: true })).toBeVisible();
});

test("search: ⌘K finds a project by title", async ({ page, request }) => {
	await api(request, session, "POST", "/project", { title: "Needle in a haystack" });
	await page.goto("/");
	await page.keyboard.press("Control+k");
	await page.getByLabel("Search", { exact: true }).fill("needle");
	await expect(page.getByRole("option", { name: /Needle in a haystack/ })).toBeVisible();
	await page.keyboard.press("Enter");
	await expect(page.getByRole("heading", { name: "Needle in a haystack" })).toBeVisible();
});

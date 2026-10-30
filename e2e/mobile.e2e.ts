import { expect, test } from "@playwright/test";

import { api, createAccount, signIn, type Session } from "./helpers";

let session: Session;

test.beforeAll(async ({ request }) => {
	session = await createAccount(request, "mobile");
});

test.beforeEach(async ({ page }) => {
	await signIn(page, session);
});

test("bottom bar + button opens the create sheet", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Create" }).tap();
	await expect(page.getByRole("dialog").getByText("New project")).toBeVisible();
	await expect(page.getByRole("dialog").getByText("New note")).toBeVisible();
});

test("board: the Move to picker changes a project's status", async ({ page, request }) => {
	const { project_id } = await api<{ project_id: string }>(request, session, "POST", "/project", { title: "Mobile move" });
	await page.goto("/projects?view=board");
	await page.getByLabel("Move Mobile move to another status").selectOption("ON_HOLD");
	await expect
		.poll(async () => (await api<{ status: string }>(request, session, "GET", `/project/${project_id}`)).status)
		.toBe("ON_HOLD");
});

test("calendar: tapping a date shows its details", async ({ page }) => {
	await page.goto("/calendar");
	await page.getByRole("button", { name: "Next month" }).tap();
	const next = new Date();
	next.setMonth(next.getMonth() + 1, 15);
	const label = next.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
	await page.getByRole("button", { name: label, exact: true }).tap();
	await expect(page.getByRole("heading", { name: label })).toBeVisible();
});

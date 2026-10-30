import { expect, test } from "@playwright/test";

import { PASSWORD, uniqueEmail } from "./helpers";

test.describe("auth", () => {
	test("sign up shows the verify-email note, then continues into the app", async ({ page }) => {
		const email = uniqueEmail("signup");
		await page.goto("/signup");
		await page.getByLabel("First name").fill("Ada");
		await page.getByLabel("Last name").fill("Lovelace");
		await page.getByLabel("Email").fill(email);
		await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
		await page.getByLabel("Confirm password").fill(PASSWORD);
		await page.getByRole("button", { name: "Create account" }).click();

		await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
		await expect(page.getByText(email)).toBeVisible();
		await expect(page.getByText(/when it expires/)).toBeVisible();

		await page.getByRole("button", { name: "Continue to Trellix" }).click();
		await expect(page).toHaveURL("/");
		await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening), Ada/ })).toBeVisible();

		await page.goto("/settings/profile");
		await expect(page.getByText("Not verified")).toBeVisible();
	});

	test("password checklist reflects the rules", async ({ page }) => {
		await page.goto("/signup");
		await page.getByLabel("Password", { exact: true }).fill("abc");
		const rule = (name: string) => page.getByRole("listitem").filter({ hasText: name });
		await expect(rule("An uppercase letter")).toHaveClass(/text-muted/);
		await page.getByLabel("Password", { exact: true }).fill("Abcdefg1!");
		for (const name of ["8–20 characters", "An uppercase letter", "A number", "A special character"]) {
			await expect(rule(name)).toHaveClass(/text-emerald/);
		}
	});

	test("an invalid verification link offers a new one", async ({ page }) => {
		await page.goto("/verify-email?token=not-a-real-token");
		await expect(page.getByRole("heading", { name: "This link doesn’t work" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Send a new link" })).toBeVisible();
	});

	test("forgot password explains that only verified emails get a link", async ({ page }) => {
		await page.goto("/login");
		await page.getByRole("link", { name: "Forgot password?" }).click();
		await page.getByLabel("Email").fill(uniqueEmail("forgot"));
		await page.getByRole("button", { name: "Send reset link" }).click();
		await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
		await expect(page.getByText(/only sent to/)).toBeVisible();
	});
});

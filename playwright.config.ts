import { defineConfig } from "@playwright/test";

/**
 * Browser tests against a running backend (E2E_API_URL, default http://127.0.0.1:5000).
 * Each run signs up a fresh throwaway account, so no fixtures are needed.
 * Uses the locally installed Chrome; no Playwright browser download required.
 */
export default defineConfig({
	testDir: "./e2e",
	testMatch: "**/*.e2e.ts",
	timeout: 30_000,
	fullyParallel: false,
	retries: 0,
	reporter: [["list"]],
	use: {
		baseURL: "http://localhost:5173",
		channel: "chrome",
		headless: true,
		// Date labels in the UI are locale-formatted; keep them predictable.
		locale: "en-US",
		trace: "retain-on-failure",
	},
	projects: [
		{ name: "desktop", use: { viewport: { width: 1440, height: 900 } }, testIgnore: "**/mobile.e2e.ts" },
		{ name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, testMatch: "**/mobile.e2e.ts" },
	],
	webServer: {
		command: "npm run dev -- --port 5173 --strictPort",
		url: "http://localhost:5173",
		reuseExistingServer: true,
		timeout: 60_000,
	},
});

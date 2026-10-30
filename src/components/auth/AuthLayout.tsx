import type { ReactNode } from "react";
import { Link } from "react-router";
import { LuMoon, LuSun } from "react-icons/lu";

import { AppBrand, BrandMark } from "@/components/layout/AppBrand";
import { iconButtonClass } from "@/components/ui/buttonStyles";
import { useTheme } from "@/contexts/theme/useTheme";

/** Split auth screen: brand panel on large screens, form on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
	const { resolvedTheme, toggleTheme } = useTheme();
	const year = new Date().getFullYear();

	return (
		<div className="flex min-h-dvh bg-bg">
			<section
				aria-label="About Trellix"
				className="relative hidden w-[46%] overflow-hidden bg-[#0b1530] text-white lg:flex lg:flex-col"
			>
				<div
					aria-hidden
					className="absolute inset-0 opacity-[.18]"
					style={{
						backgroundImage:
							"linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)",
						backgroundSize: "44px 44px",
						maskImage:
							"radial-gradient(circle at 30% 40%,#000,transparent 70%)",
					}}
				/>
				<div
					aria-hidden
					className="absolute -top-32 -right-32 size-112 rounded-full bg-primary/40 blur-3xl"
				/>
				<div className="relative flex items-center gap-2.5 p-10">
					<BrandMark className="size-9" />
					<span className="text-lg font-semibold">Trellix</span>
				</div>
				<div className="relative mt-auto px-10 pb-10">
					<h2 className="max-w-md text-3xl leading-tight font-semibold tracking-tight">
						Plan it. Build it. Ship it.
						<br />
						<span className="text-blue-300">All in one place.</span>
					</h2>
					<p className="mt-3 max-w-md text-sm text-blue-100/70">
						A project manager built for developers: link repos,
						track timelines, and keep notes next to the work they
						describe.
					</p>
					<p className="mt-8 text-xs text-blue-100/50">
						© Trellix {year} ·{" "}
						<Link
							to="/legal#terms-of-use"
							className="hover:text-blue-100 hover:underline"
						>
							Terms &amp; Privacy
						</Link>
					</p>
				</div>
			</section>

			<section className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center justify-between p-5 lg:justify-end">
					<AppBrand className="lg:hidden" />
					<button
						type="button"
						onClick={toggleTheme}
						className={iconButtonClass()}
						aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
					>
						{resolvedTheme === "dark" ? (
							<LuSun className="size-4" />
						) : (
							<LuMoon className="size-4" />
						)}
					</button>
				</div>
				<main className="flex flex-1 items-center justify-center px-5 pb-10">
					<div className="w-full max-w-sm">{children}</div>
				</main>
				{/* The brand panel shows the footer on large screens. */}
				<p className="p-5 text-center text-[11px] text-muted lg:hidden">
					© Trellix {year} ·{" "}
					<Link to="/legal#terms-of-use" className="hover:underline">
						Terms &amp; Privacy
					</Link>
				</p>
			</section>
		</div>
	);
}

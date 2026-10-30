import { Link, useNavigate } from "react-router";
import { LuArrowLeft, LuMoon, LuSun } from "react-icons/lu";

import { AppBrand } from "@/components/layout/AppBrand";
import Button from "@/components/ui/Button";
import { buttonPrimaryClass, iconButtonClass } from "@/components/ui/buttonStyles";
import { useTheme } from "@/contexts/theme/useTheme";

type HttpErrorShellProps = {
	code: string;
	title: string;
	description: string;
};

function HttpErrorShell({ code, title, description }: HttpErrorShellProps) {
	const navigate = useNavigate();
	const { resolvedTheme, toggleTheme } = useTheme();

	return (
		<div className="flex min-h-dvh flex-col bg-bg">
			<header className="flex items-center justify-between p-5">
				<AppBrand />
				<button
					type="button"
					onClick={toggleTheme}
					className={iconButtonClass()}
					aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
				>
					{resolvedTheme === "dark" ? <LuSun className="size-4" /> : <LuMoon className="size-4" />}
				</button>
			</header>
			<main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
				<p className="text-7xl font-semibold tracking-tight text-primary tabular-nums sm:text-8xl" aria-hidden>
					{code}
				</p>
				<h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
				<p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">{description}</p>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-2">
					<Button variant="secondary" icon={<LuArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
						Go back
					</Button>
					<Link to="/" replace className={buttonPrimaryClass()}>
						Go home
					</Link>
				</div>
			</main>
		</div>
	);
}

export function NotFoundPage() {
	return (
		<HttpErrorShell
			code="404"
			title="Page not found"
			description="The page you are looking for does not exist or may have been moved. Check the URL or return home."
		/>
	);
}

export function ServerErrorPage() {
	return (
		<HttpErrorShell
			code="500"
			title="Something went wrong"
			description="We hit an unexpected error on our side. Please try again in a moment. If the problem continues, contact support."
		/>
	);
}

export function ServiceUnavailablePage() {
	return (
		<HttpErrorShell
			code="503"
			title="Service unavailable"
			description="Trellix is temporarily down for maintenance or overloaded. Please try again shortly."
		/>
	);
}

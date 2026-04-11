import { Link, useNavigate } from "react-router";

import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type HttpErrorShellProps = {
	code: string;
	title: string;
	description: string;
};

function HttpErrorShell({ code, title, description }: HttpErrorShellProps) {
	const navigate = useNavigate();

	return (
		<div className="min-h-dvh bg-background-primary">
			<header className="sticky top-0 z-10 border-b border-tint bg-background-secondary/95 backdrop-blur-sm">
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
					<Link
						to="/"
						className="flex items-center gap-2 text-text-primary"
					>
						<img
							src="/layers.svg"
							alt=""
							width={32}
							height={32}
							className="size-8 shrink-0"
						/>
						<span className="text-lg font-bold tracking-tight">
							Trellix
						</span>
					</Link>
					<ThemeToggle />
				</div>
			</header>

			<main className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
				<p
					className="text-7xl font-bold tabular-nums text-primary sm:text-8xl"
					aria-hidden="true"
				>
					{code}
				</p>
				<h1 className="mt-6 text-2xl font-bold text-text-primary sm:text-3xl">
					{title}
				</h1>
				<p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
					{description}
				</p>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<Button
						title="Go back"
						fill={false}
						type="button"
						onClick={() => navigate(-1)}
					/>
					<Button
						title="Home"
						fill={true}
						type="button"
						onClick={() => navigate("/")}
					/>
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

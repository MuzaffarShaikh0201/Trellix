import { Link } from "react-router";
import { FiExternalLink } from "react-icons/fi";

import { AnimatedGridPattern } from "@/components/ui/AnimatedGridPattern";
import { cn } from "@/lib/utils";

export function AuthLayout() {
	const year = new Date().getFullYear();

	return (
		<div className="relative h-full w-full overflow-hidden bg-background-primary">
			<AnimatedGridPattern
				numSquares={30}
				maxOpacity={0.3}
				duration={3}
				repeatDelay={1}
				className={cn(
					"mask-[radial-gradient(circle_500px_at_center,white,transparent)]",
					"inset-x-0 inset-y-0 h-full",
				)}
			/>

			<div className="relative z-10 flex h-full w-full flex-col">
				<div className="flex min-h-0 flex-1 flex-col justify-center gap-2 px-6 py-8">
					<div className="mx-auto flex max-w-3xl flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
						<div className="flex shrink-0 justify-center sm:w-40 sm:pr-1">
							<img
								src="/layers.svg"
								alt=""
								width={136}
								height={136}
								className="block size-32"
								decoding="async"
							/>
						</div>
						<div className="flex min-w-0 max-w-lg flex-col items-center gap-1 pb-4 text-center sm:items-start sm:text-left">
							<h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary select-none">
								Trellix
							</h1>
							<p className="text-sm leading-snug text-wrap text-text-secondary select-none">
								A modern, React-powered project management app
								inspired by Kanban, built to organize tasks and
								stay productive.
							</p>
						</div>
					</div>
				</div>

				<footer className="mt-auto flex w-full shrink-0 flex-wrap items-center justify-between gap-4 p-4">
					<p className="text-xs text-text-secondary">
						&copy; Trellix {year}
					</p>
					<Link
						to="/legal#terms-of-use"
						className="flex flex-row items-center gap-1 text-xs text-text-secondary underline-offset-2 hover:underline"
					>
						Terms of use &amp; Privacy Policy
						<FiExternalLink className="inline-block" />
					</Link>
				</footer>
			</div>
		</div>
	);
}

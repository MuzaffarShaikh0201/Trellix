import { FaGithub } from "react-icons/fa6";

import { cn } from "@/lib/utils";

const repoPillClass = cn(
	"mt-4 inline-flex w-fit max-w-[70%] min-w-0 items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1",
	"bg-tint text-xs font-medium text-text-primary",
);

type ProjectRepoBadgeProps = {
	repoUrl: string | null;
	displayName: string | null;
};

export function ProjectRepoBadge({ repoUrl, displayName }: ProjectRepoBadgeProps) {
	const label = displayName ?? "--/--";
	const href = repoUrl?.trim() ?? "";
	const hasLink = href.length > 0;

	const content = (
		<>
			<FaGithub className="size-3.5 shrink-0" aria-hidden />
			<span className="min-w-0 truncate">{label}</span>
		</>
	);

	if (hasLink) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				onClick={(e) => e.stopPropagation()}
				className={cn(
					repoPillClass,
					"cursor-pointer transition-opacity hover:opacity-90",
				)}
				title={href}
			>
				{content}
			</a>
		);
	}

	return (
		<span
			className={repoPillClass}
			title="No repository linked"
			aria-label="No repository linked"
		>
			{content}
		</span>
	);
}

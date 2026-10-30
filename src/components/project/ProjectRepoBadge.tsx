import { LuGithub } from "react-icons/lu";

import { normalizeRepoUrl } from "@/lib/project/normalizeRepoUrl";
import { repoDisplayName } from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";

type ProjectRepoBadgeProps = {
	repoUrl: string | null;
	/** Render as a link (off inside cards that are links themselves). */
	linked?: boolean;
	className?: string;
};

export function ProjectRepoBadge({ repoUrl, linked = false, className }: ProjectRepoBadgeProps) {
	const name = repoDisplayName(repoUrl);
	if (!name) return null;
	const cls = cn(
		"inline-flex max-w-full min-w-0 items-center gap-1 rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted",
		linked && "transition-colors hover:border-primary/40 hover:text-primary",
		className,
	);
	const body = (
		<>
			<LuGithub className="size-3 shrink-0" aria-hidden />
			<span className="truncate">{name}</span>
		</>
	);
	const href = linked && repoUrl ? normalizeRepoUrl(repoUrl) : null;
	return href ? (
		<a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
			{body}
		</a>
	) : (
		<span className={cls}>{body}</span>
	);
}

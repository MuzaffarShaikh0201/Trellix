import { useNavigate } from "react-router";
import { MdStar, MdStarBorder } from "react-icons/md";

import { ProjectRepoBadge } from "@/components/project/ProjectRepoBadge";
import { projectCardShellClass } from "@/components/project/project-card-shell";
import {
	parseWorkItemStats,
	taskCompletionPercent,
} from "@/lib/project/workItemStats";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

function formatDate(value: string | null): string {
	if (!value) return "—";
	try {
		const d = new Date(value);
		const day = String(d.getDate()).padStart(2, "0");
		const month = d.toLocaleString(undefined, { month: "short" });
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	} catch {
		return value;
	}
}


const PROJECT_TITLE_MAX_CHARS = 48;

function normalizeInlineText(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxChars: number) {
	const normalized = normalizeInlineText(value);
	if (normalized.length <= maxChars) return normalized;
	return `${normalized.slice(0, maxChars).trimEnd()}...`;
}

function truncateProjectTitle(value: string) {
	return truncateText(value, PROJECT_TITLE_MAX_CHARS);
}

function getRepoDisplayName(url: string | null): string | null {
	if (!url?.trim()) return null;
	try {
		const parsed = new URL(url.trim());
		const parts = parsed.pathname.split("/").filter(Boolean);
		if (parts.length >= 2) {
			return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
		}
		if (parts.length === 1) return parts[0]!;
		return parsed.hostname.replace(/^www\./, "");
	} catch {
		const trimmed = url.trim();
		const slash = trimmed.lastIndexOf("/");
		if (slash >= 0 && slash < trimmed.length - 1) {
			return trimmed.slice(slash + 1);
		}
		return trimmed;
	}
}

export function ProjectCard({
	project,
	onToggleFavorite,
	favoritePending,
}: {
	project: Project;
	onToggleFavorite: (projectId: string) => void;
	favoritePending: boolean;
}) {
	const normalizedTitle = normalizeInlineText(project.title);
	const repoName = getRepoDisplayName(project.repo_url);
	const workItems = parseWorkItemStats(project);
	const progress = taskCompletionPercent(workItems);
	const lowPercent =
		workItems.total > 0 ? (workItems.low / workItems.total) * 100 : 0;
	const mediumPercent =
		workItems.total > 0 ? (workItems.medium / workItems.total) * 100 : 0;
	const highPercent =
		workItems.total > 0 ? (workItems.high / workItems.total) * 100 : 0;

	const navigate = useNavigate();

	function openProject() {
		navigate(`/projects/${project.id}`);
	}

	return (
		<article
			role="link"
			tabIndex={0}
			aria-label={`Open project ${normalizedTitle}`}
			onClick={openProject}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					openProject();
				}
			}}
			className={cn("group cursor-pointer", projectCardShellClass)}
		>
			<div className="flex min-h-0 flex-1 flex-col p-4 pb-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3
							className="line-clamp-2 text-base font-semibold leading-snug text-text-primary"
							title={normalizedTitle}
						>
							{truncateProjectTitle(project.title)}
						</h3>
						<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
							<ProjectStatusChip status={project.status} />
							{project.is_archived ? (
								<span className="inline-flex rounded border border-slate-500/40 px-2 py-0.5 text-[11px] font-medium text-slate-500">
									Archived
								</span>
							) : null}
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-0.5">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onToggleFavorite(project.id);
							}}
							disabled={favoritePending}
							className={cn(
								"rounded-md p-1 text-text-secondary transition-colors hover:text-yellow-500",
								favoritePending && "cursor-wait opacity-60",
							)}
							aria-label={
								project.is_favorite
									? "Remove from favorites"
									: "Add to favorites"
							}
						>
							{project.is_favorite ? (
								<MdStar className="h-[18px] w-[18px] text-yellow-500" aria-hidden />
							) : (
								<MdStarBorder className="h-[18px] w-[18px]" aria-hidden />
							)}
						</button>
					</div>
				</div>

				<ProjectRepoBadge
					repoUrl={project.repo_url}
					displayName={repoName}
				/>

				<div className="min-h-2 flex-1" aria-hidden />

				<div className="grid shrink-0 grid-cols-2 gap-3">
					<div className="min-w-0">
						<p className="text-[11px] text-text-secondary">Work Items (%)</p>
						<div className="mt-1 flex items-center gap-1 text-sm font-medium text-text-primary">
							<span>{workItems.low}</span>
							<span className="text-text-secondary">·</span>
							<span>{workItems.medium}</span>
							<span className="text-text-secondary">·</span>
							<span>{workItems.high}</span>
						</div>
						<div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-tint">
							<div
								className="bg-sky-500"
								style={{ width: `${lowPercent}%` }}
								aria-hidden
							/>
							<div
								className="bg-cyan-400"
								style={{ width: `${mediumPercent}%` }}
								aria-hidden
							/>
							<div
								className="bg-red-500"
								style={{ width: `${highPercent}%` }}
								aria-hidden
							/>
						</div>
					</div>
					<div className="min-w-0">
						<p className="text-[11px] text-text-secondary">Tasks Completed</p>
						<div className="mt-1 flex items-center justify-between text-sm font-medium text-text-primary">
							<span>{progress}%</span>
							<span className="text-xs text-text-secondary">
								{workItems.completed}/{workItems.total}
							</span>
						</div>
						<div className="mt-1.5 h-1 overflow-hidden rounded-full bg-tint">
							<div
								className="h-full rounded-full bg-emerald-500"
								style={{ width: `${progress}%` }}
								aria-hidden
							/>
						</div>
					</div>
				</div>
			</div>

			<footer
				className={cn(
					"mt-0.5 grid shrink-0 grid-cols-2 gap-4 px-4 py-3",
					"bg-transparent transition-colors",
					"max-sm:bg-tint sm:group-hover:bg-tint",
				)}
			>
				<div>
					<p className="text-xs text-text-secondary">Start Date:</p>
					<p className="mt-0.5 text-sm font-semibold text-text-primary">
						{formatDate(project.start_date)}
					</p>
				</div>
				<div>
					<p className="text-xs text-text-secondary">End Date:</p>
					<p className="mt-0.5 text-sm font-semibold text-text-primary">
						{formatDate(project.end_date)}
					</p>
				</div>
			</footer>
		</article>
	);
}

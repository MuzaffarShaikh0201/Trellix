import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import {
	LuChevronRight,
	LuFilePlus,
	LuFlag,
	LuFolderPlus,
	LuLightbulb,
	LuNotebookPen,
	LuPin,
	LuRocket,
	LuStar,
	LuTriangleAlert,
} from "react-icons/lu";

import { Page, PageHeader } from "@/components/layout/AppShell";
import { useShell } from "@/components/layout/shell-context";
import { NoteProjectBadge } from "@/components/note/NoteProjectBadge";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { DueLabel, TimelineBar } from "@/components/project/ProjectTimeline";
import { ProjectTile } from "@/components/project/ProjectTile";
import Button from "@/components/ui/Button";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { Card, CardHeader, EmptyState, ErrorState, Skeleton, cardClass } from "@/components/ui/Card";
import { useAuth } from "@/contexts/auth";
import { useDashboardHistoryReset } from "@/hooks/useDashboardHistoryReset";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { notePreview } from "@/lib/note/noteDisplay";
import { daysUntil, parseDay, timeAgo, timelinePercent } from "@/lib/project/projectDisplay";
import { PROJECT_STATUSES, PROJECT_STATUS_META } from "@/lib/project/projectStatusStyles";
import { useAllNotes, useAllProjects, useProjectStatusCounts, useRecentProjects } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

function greeting() {
	const h = new Date().getHours();
	if (h < 5) return "Good evening";
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
}

const linkClass = "text-xs font-medium text-primary hover:underline";

export function DashboardPage() {
	useDashboardHistoryReset();
	const { user } = useAuth();
	const { openCreateProject } = useShell();
	const { counts, isPending: countsPending } = useProjectStatusCounts();
	const recent = useRecentProjects();
	const all = useAllProjects();
	const notes = useAllNotes();

	const byId = useMemo(
		() => new Map((all.data?.projects ?? []).map((p) => [p.id, p])),
		[all.data],
	);

	const upcoming = useMemo(
		() =>
			(all.data?.projects ?? [])
				.filter((p) => p.end_date && p.status !== "COMPLETED" && p.status !== "ABANDONED")
				.sort((a, b) => parseDay(a.end_date)!.getTime() - parseDay(b.end_date)!.getTime())
				.slice(0, 5),
		[all.data],
	);
	const dueSoon = upcoming.filter((p) => {
		const d = daysUntil(p.end_date);
		return d !== null && d >= 0 && d <= 14;
	}).length;
	const overdue = upcoming.filter((p) => (daysUntil(p.end_date) ?? 0) < 0).length;

	const pinned = (notes.data?.notes ?? []).filter((n) => n.is_pinned).slice(0, 6);
	const pinnedCount = (notes.data?.notes ?? []).filter((n) => n.is_pinned).length;
	const total = counts.ALL ?? 0;
	const isNewUser = !countsPending && total === 0;

	const dateLabel = new Date().toLocaleDateString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

	return (
		<Page>
			<PageHeader
				eyebrow={dateLabel}
				title={`${greeting()}${user?.first_name ? `, ${user.first_name}` : ""}`}
				actions={
					<>
						<Link to="/notes/new" className={buttonSecondaryClass()}>
							<LuFilePlus className="size-4" />
							New note
						</Link>
						<Button icon={<LuFolderPlus className="size-4" />} onClick={openCreateProject}>
							New project
						</Button>
					</>
				}
			/>

			{isNewUser ? (
				<Card className="mt-6">
					<EmptyState
						icon={<LuRocket />}
						title="Welcome to Trellix"
						description="Create your first project to track its timeline, link its repository and keep notes next to it."
						action={
							<Button icon={<LuFolderPlus className="size-4" />} onClick={openCreateProject}>
								Create your first project
							</Button>
						}
					/>
				</Card>
			) : (
				<>
					<div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
						<StatTile
							to="/projects?status=IN_PROGRESS"
							label="In progress"
							icon={<LuRocket />}
							tint="bg-primary/10 text-primary"
							value={counts.IN_PROGRESS}
							sub={`of ${total} active projects`}
						/>
						<StatTile
							to="/calendar"
							label="Due in 14 days"
							icon={<LuFlag />}
							tint="bg-amber-500/10 text-amber-600 dark:text-amber-400"
							value={all.isPending ? undefined : dueSoon}
							sub={overdue ? `${overdue} overdue` : "deadlines coming up"}
							subClass={overdue ? "text-red-600 dark:text-red-400" : undefined}
						/>
						<StatTile
							to="/projects?status=PLANNING"
							label="Planning"
							icon={<LuLightbulb />}
							tint="bg-violet-500/10 text-violet-600 dark:text-violet-400"
							value={counts.PLANNING}
							sub="ready to kick off"
						/>
						<StatTile
							to="/notes"
							label="Notes"
							icon={<LuNotebookPen />}
							tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
							value={notes.data?.total_items}
							sub={`${pinnedCount} pinned`}
						/>
					</div>

					<div className="mt-4 grid gap-4 lg:grid-cols-3">
						<Card className="lg:col-span-2">
							<CardHeader title="Jump back in" action={<Link to="/projects" className={linkClass}>All projects</Link>} />
							{recent.isError ? (
								<ErrorState
									className="m-4"
									title="Could not load recent projects"
									message={getRequestErrorMessage(recent.error, "Please try again.")}
									onRetry={() => void recent.refetch()}
									retrying={recent.isRefetching}
								/>
							) : recent.isPending ? (
								<RowsSkeleton />
							) : (
								<ul className="divide-y divide-line">
									{recent.data.projects.map((r) => {
										const full = byId.get(r.id);
										return (
											<li key={r.id}>
												<Link
													to={`/projects/${r.id}`}
													className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60"
												>
													<ProjectTile project={full ?? r} className="size-8 text-[11px]" />
													<div className="min-w-0 flex-1">
														<p className="flex items-center gap-1 truncate text-sm font-medium">
															<span className="truncate">{r.title}</span>
															{r.is_favorite ? (
																<LuStar className="size-3 shrink-0 fill-amber-400 text-amber-400" aria-label="Favorite" />
															) : null}
														</p>
														<p className="text-[11px] text-muted">Updated {timeAgo(r.updated_at)}</p>
													</div>
													{full ? (
														<div className="hidden w-36 sm:block">
															<div className="flex justify-between text-[11px]">
																<span className="text-muted">{timelinePercent(full)}%</span>
																<DueLabel project={full} />
															</div>
															<TimelineBar project={full} className="mt-1 h-1" />
														</div>
													) : null}
													<ProjectStatusChip status={r.status} className="max-md:hidden" />
													<LuChevronRight className="size-4 text-muted" aria-hidden />
												</Link>
											</li>
										);
									})}
								</ul>
							)}
						</Card>

						<Card>
							<CardHeader title="Upcoming deadlines" action={<Link to="/calendar" className={linkClass}>Calendar</Link>} />
							{all.isPending ? (
								<RowsSkeleton rows={4} />
							) : upcoming.length ? (
								<ul className="space-y-1 p-2">
									{upcoming.map((p) => (
										<DeadlineRow key={p.id} project={p} />
									))}
								</ul>
							) : (
								<p className="px-4 py-10 text-center text-sm text-muted">
									No upcoming deadlines. Add an end date to a project to see it here.
								</p>
							)}
						</Card>
					</div>

					<div className="mt-4 grid gap-4 lg:grid-cols-3">
						<Card className="lg:col-span-2">
							<CardHeader title="Pinned notes" icon={<LuPin />} action={<Link to="/notes" className={linkClass}>All notes</Link>} />
							{notes.isPending ? (
								<div className="grid gap-2 p-3 sm:grid-cols-3">
									{[0, 1, 2].map((i) => (
										<Skeleton key={i} className="h-24 rounded-lg" />
									))}
								</div>
							) : pinned.length ? (
								<div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
									{pinned.map((n) => (
										<Link
											key={n.id}
											to={`/notes/${n.id}`}
											className="flex min-w-0 flex-col rounded-lg border border-line p-3 transition hover:border-primary/40 hover:bg-surface-2/40"
										>
											<p className="truncate text-sm font-medium">{n.title?.trim() || "Untitled note"}</p>
											{notePreview(n) ? (
												<p className="mt-1 line-clamp-2 text-xs text-muted">{notePreview(n)}</p>
											) : (
												<p className="mt-0.5 text-[11px] text-muted">Edited {timeAgo(n.updated_at)}</p>
											)}
											<div className="flex-1" />
											<div className="mt-2.5">
												<NoteProjectBadge project={n.project} color={n.project ? byId.get(n.project.id)?.color : undefined} />
											</div>
										</Link>
									))}
								</div>
							) : (
								<p className="px-4 py-10 text-center text-sm text-muted">
									Pin a note to keep it here for quick access.
								</p>
							)}
						</Card>

						<Card className="p-4">
							<h2 className="text-sm font-semibold">Projects by status</h2>
							<div className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-2">
								{total > 0
									? PROJECT_STATUSES.map((s) =>
											counts[s] ? (
												<div
													key={s}
													className={PROJECT_STATUS_META[s].dot}
													style={{ width: `${((counts[s] ?? 0) / total) * 100}%` }}
												/>
											) : null,
										)
									: null}
							</div>
							<ul className="mt-4 space-y-2">
								{PROJECT_STATUSES.map((s) => (
									<li key={s}>
										<Link to={`/projects?status=${s}`} className="flex items-center gap-2 text-sm hover:text-primary">
											<span className={cn("size-2 rounded-full", PROJECT_STATUS_META[s].dot)} />
											<span className="flex-1 text-muted">{PROJECT_STATUS_META[s].label}</span>
											<span className="font-medium tabular-nums">{counts[s] ?? "–"}</span>
										</Link>
									</li>
								))}
							</ul>
						</Card>
					</div>
				</>
			)}
		</Page>
	);
}

function StatTile({
	to,
	label,
	icon,
	tint,
	value,
	sub,
	subClass,
}: {
	to: string;
	label: string;
	icon: ReactNode;
	tint: string;
	value: number | undefined;
	sub: string;
	subClass?: string;
}) {
	return (
		<Link to={to} className={cn(cardClass, "p-4 transition hover:border-primary/40")}>
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium text-muted">{label}</span>
				<span className={cn("grid size-7 place-items-center rounded-lg [&>svg]:size-3.5", tint)}>{icon}</span>
			</div>
			{value === undefined ? (
				<Skeleton className="mt-2.5 h-7 w-10" />
			) : (
				<p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
			)}
			<p className={cn("mt-0.5 text-[11px] text-muted", subClass)}>{sub}</p>
		</Link>
	);
}

function DeadlineRow({ project }: { project: Project }) {
	const end = parseDay(project.end_date)!;
	const overdue = (daysUntil(project.end_date) ?? 0) < 0;
	return (
		<li>
			<Link to={`/projects/${project.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2/60">
				<div className="grid w-11 shrink-0 place-items-center rounded-lg border border-line py-1 text-center">
					<span className="text-[10px] font-medium text-muted uppercase">
						{end.toLocaleDateString(undefined, { month: "short" })}
					</span>
					<span className="text-sm leading-none font-semibold">{end.getDate()}</span>
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{project.title}</p>
					<DueLabel project={project} className="text-[11px] font-normal" />
				</div>
				{overdue ? <LuTriangleAlert className="size-4 text-red-500" aria-label="Overdue" /> : null}
			</Link>
		</li>
	);
}

function RowsSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-3 p-4">
			{Array.from({ length: rows }, (_, i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="size-8 rounded-lg" />
					<div className="flex-1 space-y-1.5">
						<Skeleton className="h-3.5 w-1/3" />
						<Skeleton className="h-2.5 w-1/5" />
					</div>
				</div>
			))}
		</div>
	);
}

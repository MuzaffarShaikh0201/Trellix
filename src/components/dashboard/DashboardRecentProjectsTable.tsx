import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { FaRegStar, FaStar } from "react-icons/fa";

import { RecentProjectsTableSkeleton } from "@/components/dashboard/RecentProjectsTableSkeleton";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { fetchRecentProjects } from "@/lib/api/projects";
import { formatProjectDateTime } from "@/lib/project/formatProjectDate";
import {
	getRecentProjectId,
	RECENT_PROJECTS_ROW_COUNT,
} from "@/lib/project/recentProject";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import type { RecentProjectItem } from "@/types/project";

const RECENT_QUERY_KEY = ["projects", "recent"] as const;

const COLUMN_COUNT = 5;

const thClass =
	"whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-text-secondary md:px-4 md:text-xs";

const tdClass = "px-3 py-3 align-middle md:px-4";

function padToRowCount<T>(items: T[]): (T | null)[] {
	const padded: (T | null)[] = items.slice(0, RECENT_PROJECTS_ROW_COUNT);
	while (padded.length < RECENT_PROJECTS_ROW_COUNT) {
		padded.push(null);
	}
	return padded;
}

function EmptyTableRow({ message }: { message?: ReactNode }) {
	return (
		<tr className="border-t border-primary/10">
			<td className={cn(tdClass, "max-w-[12rem] text-text-secondary")}>—</td>
			<td className={tdClass}>—</td>
			<td className={cn(tdClass, "text-center text-text-secondary")}>—</td>
			<td className={cn(tdClass, "text-text-secondary")}>—</td>
			<td className={cn(tdClass, "text-text-secondary")}>
				{message ?? "—"}
			</td>
		</tr>
	);
}

function RecentProjectTitleCell({ project }: { project: RecentProjectItem }) {
	const projectId = getRecentProjectId(project);

	return (
		<Link
			to={`/projects/${projectId}`}
			className="block max-w-[12rem] truncate font-medium text-text-primary transition-colors hover:text-primary md:max-w-[14rem]"
			title={project.title}
		>
			{project.title}
		</Link>
	);
}

function RecentProjectDataRow({ project }: { project: RecentProjectItem }) {
	return (
		<tr className="border-t border-primary/10 transition-colors hover:bg-tint/50">
			<td className={cn(tdClass, "max-w-0")}>
				<RecentProjectTitleCell project={project} />
			</td>
			<td className={cn(tdClass, "whitespace-nowrap")}>
				<ProjectStatusChip status={project.status} />
			</td>
			<td className={cn(tdClass, "text-center")}>
				{project.is_favorite ? (
					<FaStar
						className="inline-block h-4 w-4 text-yellow-500"
						aria-label="Favorite"
					/>
				) : (
					<FaRegStar
						className="inline-block h-4 w-4 text-text-secondary"
						aria-label="Not a favorite"
					/>
				)}
			</td>
			<td
				className={cn(
					tdClass,
					"whitespace-nowrap tabular-nums text-text-secondary",
				)}
			>
				<time dateTime={project.created_at}>
					{formatProjectDateTime(project.created_at)}
				</time>
			</td>
			<td
				className={cn(
					tdClass,
					"whitespace-nowrap tabular-nums text-text-secondary",
				)}
			>
				<time dateTime={project.updated_at}>
					{formatProjectDateTime(project.updated_at)}
				</time>
			</td>
		</tr>
	);
}

export function DashboardRecentProjectsTable() {
	const { data, isPending, isFetching, isError, error, refetch, isRefetching } =
		useQuery({
			queryKey: RECENT_QUERY_KEY,
			queryFn: fetchRecentProjects,
		});

	const projects = data?.projects ?? [];
	const showSkeleton = isPending || (isFetching && !data);

	return (
		<div className="w-fit max-w-full">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
				<h2
					id="recent-projects-heading"
					className="text-sm font-semibold text-primary"
				>
					Recent projects
				</h2>
				<div className="flex items-center gap-3">
					{isRefetching && !showSkeleton ? (
						<span className="text-[10px] text-text-secondary sm:text-xs">
							Refreshing…
						</span>
					) : null}
					<Link
						to="/projects"
						className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
					>
						View all
					</Link>
				</div>
			</div>

			<div
				className={cn(
					"overflow-hidden rounded-xl border border-primary/10",
					"bg-background-secondary",
				)}
				aria-labelledby="recent-projects-heading"
			>
				<div className="custom-scrollbar overflow-x-auto">
					<table
						className="w-auto border-collapse text-sm"
						aria-busy={showSkeleton}
					>
						<thead className="bg-tint">
							<tr>
								<th scope="col" className={cn(thClass, "min-w-[10rem]")}>
									Project
								</th>
								<th scope="col" className={thClass}>
									Status
								</th>
								<th
									scope="col"
									className={cn(thClass, "w-16 text-center")}
								>
									Favorite
								</th>
								<th scope="col" className={thClass}>
									Created on
								</th>
								<th scope="col" className={thClass}>
									Last updated
								</th>
							</tr>
						</thead>
						<tbody>
							{showSkeleton ? (
								<RecentProjectsTableSkeleton />
							) : isError ? (
								<>
									<tr className="border-t border-primary/10">
										<td
											colSpan={COLUMN_COUNT}
											className="px-4 py-6 text-center md:px-5"
										>
											<p className="text-sm font-medium text-red-600 dark:text-red-400">
												Could not load recent projects
											</p>
											<p className="mt-1 text-sm text-text-secondary">
												{getRequestErrorMessage(
													error,
													"Something went wrong while loading recent projects.",
												)}
											</p>
											<button
												type="button"
												onClick={() => void refetch()}
												className={cn("mt-3", buttonSecondaryClass())}
											>
												Try again
											</button>
										</td>
									</tr>
									{Array.from(
										{ length: RECENT_PROJECTS_ROW_COUNT - 1 },
										(_, i) => (
											<EmptyTableRow key={`error-pad-${i}`} />
										),
									)}
								</>
							) : (
								padToRowCount(projects).map((project, index) => {
									if (project) {
										return (
											<RecentProjectDataRow
												key={project.id}
												project={project}
											/>
										);
									}

									if (projects.length === 0 && index === 0) {
										return (
											<tr
												key="empty-message"
												className="border-t border-primary/10"
											>
												<td
													colSpan={COLUMN_COUNT}
													className="px-4 py-4 text-center text-sm text-text-secondary md:px-5"
												>
													No recent projects yet.{" "}
													<Link
														to="/projects"
														className="font-medium text-primary"
													>
														Create one
													</Link>
													.
												</td>
											</tr>
										);
									}

									return (
										<EmptyTableRow key={`empty-row-${index}`} />
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

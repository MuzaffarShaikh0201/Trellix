import { useState, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import { Link, useParams } from "react-router";

import { MdArrowBack } from "react-icons/md";



import { ProjectHeaderStats } from "@/components/project/ProjectHeaderStats";

import { fetchProject } from "@/lib/api/projects";

import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";

import { cn } from "@/lib/utils";

import type { Project, ProjectStatus } from "@/types/project";



type ProjectDetailTab = "DETAILS" | "TASKS" | "NOTES" | "TIMELINE";



const PROJECT_DETAIL_TABS: { value: ProjectDetailTab; label: string }[] = [

	{ value: "DETAILS", label: "Details" },

	{ value: "TASKS", label: "Tasks" },

	{ value: "NOTES", label: "Notes" },

	{ value: "TIMELINE", label: "Timeline" },

];



const statusClassMap: Record<ProjectStatus, string> = {

	PLANNING: "border-violet-500/50 text-violet-500",

	IN_PROGRESS: "border-primary/50 text-primary",

	ON_HOLD: "border-violet-400/50 text-violet-400",

	COMPLETED: "border-emerald-500/50 text-emerald-500",

	ABANDONED: "border-red-500/50 text-red-500",

};



function formatCreatedAt(value: string): string {

	const d = new Date(value);

	if (Number.isNaN(d.getTime())) return value;

	const day = String(d.getDate()).padStart(2, "0");

	const month = d.toLocaleString(undefined, { month: "short" });

	const year = d.getFullYear();

	const time = d.toLocaleString(undefined, {

		hour: "numeric",

		minute: "2-digit",

		hour12: true,

	});

	return `${day}/${month}/${year} ${time}`;

}



function formatDate(value: string | null): string {

	if (!value) return "—";

	const d = new Date(value);

	if (Number.isNaN(d.getTime())) return value;

	const day = String(d.getDate()).padStart(2, "0");

	const month = d.toLocaleString(undefined, { month: "short" });

	const year = d.getFullYear();

	return `${day}/${month}/${year}`;

}



function prettifyToken(value: string) {

	return value

		.toLowerCase()

		.replace(/_/g, " ")

		.replace(/\b\w/g, (c) => c.toUpperCase());

}



export function ProjectPage() {

	const { projectId } = useParams<{ projectId: string }>();

	const [activeTab, setActiveTab] = useState<ProjectDetailTab>("DETAILS");



	const {

		data: project,

		isPending,

		isError,

		error,

		refetch,

		isRefetching,

	} = useQuery({

		queryKey: ["project", projectId],

		queryFn: () => fetchProject(projectId!),

		enabled: Boolean(projectId),

	});



	if (!projectId) {

		return (

			<section className="space-y-4">

				<BackToProjectsLink />

				<p className="text-sm text-text-secondary">Project not found.</p>

			</section>

		);

	}



	const showTabs = isPending || Boolean(project);



	return (

		<section>

			<BackToProjectsLink />



			{isPending ? (

				<div

					className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"

					aria-hidden

				>

					<div className="min-w-0 space-y-2">

						<div className="h-8 w-[min(100%,20rem)] animate-pulse rounded-lg bg-tint" />

						<div className="h-4 w-52 animate-pulse rounded bg-tint" />

					</div>

					<div className="hidden gap-3 md:flex sm:gap-4">

						<div className="flex w-[8.75rem] flex-col gap-1.5 sm:w-36">

							<div className="h-3 w-20 animate-pulse rounded bg-tint" />

							<div className="h-4 w-full animate-pulse rounded bg-tint" />

							<div className="h-1 w-full animate-pulse rounded-full bg-tint" />

						</div>

						<div className="flex w-[8.75rem] flex-col gap-1.5 sm:w-36">

							<div className="h-3 w-24 animate-pulse rounded bg-tint" />

							<div className="h-4 w-full animate-pulse rounded bg-tint" />

							<div className="h-1 w-full animate-pulse rounded-full bg-tint" />

						</div>

					</div>

				</div>

			) : isError ? (

				<div className="mt-6 space-y-2">

					<p className="text-sm text-text-secondary">

						{getRequestErrorMessage(

							error,

							"Something went wrong while loading this project.",

						)}

					</p>

					<button

						type="button"

						onClick={() => void refetch()}

						disabled={isRefetching}

						className={cn(

							"rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors",

							"hover:bg-primary/20 disabled:cursor-wait disabled:opacity-60",

						)}

					>

						Try again

					</button>

				</div>

			) : project ? (

				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

					<div className="min-w-0 space-y-2">

						<h1 className="text-2xl font-bold text-text-primary">

							{project.title}

						</h1>

						<p className="text-sm text-text-secondary">

							Created on{" "}

							<time

								dateTime={project.created_at}

								className="text-text-primary"

							>

								{formatCreatedAt(project.created_at)}

							</time>

						</p>

					</div>

					<ProjectHeaderStats project={project} />

				</div>

			) : null}



			{showTabs ? (

				<>

					<div className="mt-3 flex items-center gap-1">

						{PROJECT_DETAIL_TABS.map((tab) => {

							const isActive = activeTab === tab.value;

							return (

								<button

									key={tab.value}

									type="button"

									onClick={() => setActiveTab(tab.value)}

									disabled={isPending}

									className={cn(

										"border-b-2 px-3 py-2 text-sm font-medium transition-colors",

										isActive

											? "border-primary text-primary"

											: "border-transparent text-text-secondary hover:text-text-primary",

										isPending && "pointer-events-none opacity-60",

									)}

									aria-pressed={isActive}

								>

									{tab.label}

								</button>

							);

						})}

					</div>



					<div className="mt-4">

						{isPending ? (

							<div className="space-y-3" aria-hidden>

								<div className="h-4 w-full max-w-md animate-pulse rounded bg-tint" />

								<div className="h-4 w-full max-w-sm animate-pulse rounded bg-tint" />

								<div className="h-4 w-full max-w-lg animate-pulse rounded bg-tint" />

							</div>

						) : project ? (

							<ProjectTabPanel tab={activeTab} project={project} />

						) : null}

					</div>

				</>

			) : null}

		</section>

	);

}



type ProjectTabPanelProps = {

	tab: ProjectDetailTab;

	project: Project;

};



function ProjectTabPanel({ tab, project }: ProjectTabPanelProps) {

	switch (tab) {

		case "DETAILS":

			return <ProjectDetailsPanel project={project} />;

		case "TASKS":

			return (

				<TabPlaceholder message="Tasks for this project will appear here." />

			);

		case "NOTES":

			return (

				<TabPlaceholder message="Notes for this project will appear here." />

			);

		case "TIMELINE":

			return (

				<TabPlaceholder message="Timeline events for this project will appear here." />

			);

	}

}



function TabPlaceholder({ message }: { message: string }) {

	return <p className="text-sm text-text-secondary">{message}</p>;

}



function ProjectDetailsPanel({ project }: { project: Project }) {

	return (

		<div className="space-y-5 text-sm">

			<div>

				<h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">

					Status

				</h2>

				<span

					className={cn(

						"mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",

						statusClassMap[project.status],

					)}

				>

					{prettifyToken(project.status)}

				</span>

			</div>



			{project.description ? (

				<div>

					<h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">

						Description

					</h2>

					<p className="mt-1.5 whitespace-pre-wrap text-text-primary">

						{project.description}

					</p>

				</div>

			) : null}



			<dl className="grid gap-4 sm:grid-cols-2">

				<DetailField label="Repository">

					{project.repo_url ? (

						<a

							href={project.repo_url}

							target="_blank"

							rel="noopener noreferrer"

							className="text-primary transition-colors hover:text-primary/80"

						>

							{project.repo_url}

						</a>

					) : (

						<span className="text-text-secondary">No repository linked</span>

					)}

				</DetailField>

				<DetailField label="Start date">

					{formatDate(project.start_date)}

				</DetailField>

				<DetailField label="End date">

					{formatDate(project.end_date)}

				</DetailField>

				<DetailField label="Last updated">

					<time dateTime={project.updated_at} className="text-text-primary">

						{formatCreatedAt(project.updated_at)}

					</time>

				</DetailField>

			</dl>

		</div>

	);

}



function DetailField({

	label,

	children,

}: {

	label: string;

	children: ReactNode;

}) {

	return (

		<div>

			<dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">

				{label}

			</dt>

			<dd className="mt-1.5 text-text-primary">{children}</dd>

		</div>

	);

}



function BackToProjectsLink() {

	return (

		<Link

			to="/projects"

			className={cn(

				"inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors",

				"hover:text-primary",

			)}

		>

			<MdArrowBack className="h-[18px] w-[18px] shrink-0" aria-hidden />

			Back to Projects

		</Link>

	);

}



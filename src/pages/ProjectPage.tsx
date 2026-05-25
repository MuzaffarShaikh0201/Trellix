import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { FaRegStar, FaStar } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

import { ProjectHeaderStats } from "@/components/project/ProjectHeaderStats";
import { ProjectPrimaryDetails } from "@/components/project/ProjectPrimaryDetails";
import { ProjectTimestampsMeta } from "@/components/project/ProjectTimestampsMeta";
import { fetchProject, toggleProjectFavorite } from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";

import type { Project } from "@/types/project";



type ProjectDetailTab = "DETAILS" | "TASKS" | "NOTES" | "TIMELINE";



const PROJECT_DETAIL_TABS: { value: ProjectDetailTab; label: string }[] = [

	{ value: "DETAILS", label: "Details" },

	{ value: "TASKS", label: "Tasks" },

	{ value: "NOTES", label: "Notes" },

	{ value: "TIMELINE", label: "Timeline" },

];



export function ProjectPage() {
	const queryClient = useQueryClient();
	const { projectId } = useParams<{ projectId: string }>();
	const [activeTab, setActiveTab] = useState<ProjectDetailTab>("DETAILS");

	const projectQueryKey = ["project", projectId] as const;

	const {
		data: project,
		isPending,
		isError,
		error,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: projectQueryKey,
		queryFn: () => fetchProject(projectId!),
		enabled: Boolean(projectId),
	});

	const favoriteMutation = useMutation({
		mutationFn: toggleProjectFavorite,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: projectQueryKey });
			const previous = queryClient.getQueryData<Project>(projectQueryKey);
			queryClient.setQueryData<Project>(projectQueryKey, (current) => {
				if (!current) return current;
				return { ...current, is_favorite: !current.is_favorite };
			});
			return { previous };
		},
		onError: (err, _projectId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(projectQueryKey, context.previous);
			}
			showAlert(
				"Could not update favorite",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating favorite status.",
				),
			);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: projectQueryKey });
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});

	if (!projectId) {

		return (

			<section className="space-y-4">
				<ProjectPageToolbar backOnly />

				<p className="text-sm text-text-secondary">Project not found.</p>

			</section>

		);

	}



	const showTabs = isPending || Boolean(project);



	return (
		<section className="flex min-h-0 flex-1 flex-col">
			<ProjectPageToolbar
				isFavorite={project?.is_favorite ?? false}
				favoritePending={favoriteMutation.isPending}
				favoriteDisabled={isPending || !project}
				showFavorite={!isError}
				onToggleFavorite={() => {
					if (projectId) favoriteMutation.mutate(projectId);
				}}
			/>

			{isPending ? (

				<div

					className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"

					aria-hidden

				>

					<div className="min-w-0 space-y-2">
						<div className="h-8 w-[min(100%,20rem)] animate-pulse rounded-lg bg-tint" />
						<div className="h-4 w-full max-w-xl animate-pulse rounded bg-tint" />
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
							buttonSecondaryClass(),
							"disabled:cursor-wait",
						)}

					>

						Try again

					</button>

				</div>

			) : project ? (

				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

					<div className="min-w-0">
						<h1 className="text-2xl font-bold text-text-primary">
							{project.title}
						</h1>
						<ProjectTimestampsMeta createdAt={project.created_at} />
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



					<div
						className={cn(
							"mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-primary/10",
							"bg-background-secondary",
						)}
					>
						<div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
							{isPending ? (
								<div className="w-full space-y-6" aria-hidden>
									<div className="w-full">
										<div className="flex flex-col gap-4 md:flex-row md:gap-4">
											<div className="space-y-2 md:w-60">
												<div className="h-3 w-16 animate-pulse rounded bg-tint" />
												<div className="h-10 w-full animate-pulse rounded-lg bg-tint" />
											</div>
											<div className="space-y-2 md:w-60">
												<div className="h-3 w-24 animate-pulse rounded bg-tint" />
												<div className="h-10 w-full animate-pulse rounded-lg bg-tint" />
											</div>
										</div>
									</div>
									<div className="w-full space-y-6">
										<div className="space-y-4 border-t border-primary/10 pt-6">
											<div className="h-4 w-28 animate-pulse rounded bg-tint" />
											<div className="w-full space-y-4 md:w-fit">
												<div className="h-20 w-full animate-pulse rounded-lg bg-tint" />
												<div className="flex flex-col gap-4 md:flex-row md:gap-4">
													<div className="h-10 w-full animate-pulse rounded-lg bg-tint md:w-[26rem]" />
													<div className="h-10 w-full animate-pulse rounded-lg bg-tint md:w-60" />
													<div className="h-10 w-full animate-pulse rounded-lg bg-tint md:w-60" />
												</div>
											</div>
										</div>
										<div className="space-y-5 border-t border-primary/10 pt-6">
											<div className="h-4 w-16 animate-pulse rounded bg-tint" />
											{Array.from({ length: 3 }, (_, i) => (
												<div key={i} className="space-y-2">
													<div className="h-8 w-full animate-pulse rounded bg-tint" />
													<div className="h-8 w-28 animate-pulse rounded-lg bg-tint" />
												</div>
											))}
										</div>
									</div>
								</div>
							) : project ? (
								<ProjectTabPanel tab={activeTab} project={project} />
							) : null}
						</div>
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

	return (
		<p className="w-full text-sm text-text-secondary">{message}</p>
	);

}



function ProjectDetailsPanel({ project }: { project: Project }) {
	return <ProjectPrimaryDetails project={project} />;
}



type ProjectPageToolbarProps = {
	backOnly?: boolean;
	isFavorite?: boolean;
	favoritePending?: boolean;
	favoriteDisabled?: boolean;
	showFavorite?: boolean;
	onToggleFavorite?: () => void;
};

function ProjectPageToolbar({
	backOnly = false,
	isFavorite = false,
	favoritePending = false,
	favoriteDisabled = false,
	showFavorite = true,
	onToggleFavorite,
}: ProjectPageToolbarProps) {
	return (
		<div className="flex items-center justify-between gap-3">
			<Link
				to="/projects"
				className={cn(
					"inline-flex min-w-0 items-center gap-1 text-sm font-medium text-text-secondary transition-colors",
					"hover:text-primary",
				)}
			>
				<MdArrowBack className="h-[18px] w-[18px] shrink-0" aria-hidden />
				Back to Projects
			</Link>

			{!backOnly && showFavorite ? (
				<button
					type="button"
					onClick={onToggleFavorite}
					disabled={
						favoritePending || favoriteDisabled || !onToggleFavorite
					}
					className={cn(
						"shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:text-yellow-500",
						(favoritePending || favoriteDisabled || !onToggleFavorite) &&
							"cursor-not-allowed opacity-60",
					)}
					aria-label={
						isFavorite ? "Remove from favorites" : "Add to favorites"
					}
				>
					{isFavorite ? (
						<FaStar
							className="h-[18px] w-[18px] text-yellow-500"
							aria-hidden
						/>
					) : (
						<FaRegStar className="h-[18px] w-[18px]" aria-hidden />
					)}
				</button>
			) : null}
		</div>
	);
}



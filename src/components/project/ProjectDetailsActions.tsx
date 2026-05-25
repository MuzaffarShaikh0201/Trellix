import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import {
	actionButtonDangerClass,
	actionButtonPrimaryTintClass,
	actionButtonWarningClass,
} from "@/components/ui/buttonStyles";
import { outlinedFieldLabelClass } from "@/components/ui/OutlinedField";
import {
	deleteProject,
	toggleProjectArchived,
	toggleProjectFavorite,
} from "@/lib/api/projects";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type { Project } from "@/types/project";

type ProjectDetailsActionsProps = {
	project: Project;
};

type ProjectActionItemProps = {
	description: string;
	buttonLabel: string;
	onClick: () => void;
	disabled?: boolean;
	buttonClassName: string;
};

function ProjectActionItem({
	description,
	buttonLabel,
	onClick,
	disabled = false,
	buttonClassName,
}: ProjectActionItemProps) {
	return (
		<div className="space-y-2">
			<p
				className={cn(
					outlinedFieldLabelClass,
					"max-lg:whitespace-normal lg:whitespace-nowrap",
				)}
			>
				{description}
			</p>
			<button
				type="button"
				onClick={onClick}
				disabled={disabled}
				className={cn(buttonClassName, "w-fit max-w-full")}
			>
				{buttonLabel}
			</button>
		</div>
	);
}

export function ProjectDetailsActions({ project }: ProjectDetailsActionsProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const projectQueryKey = ["project", project.id] as const;

	const favoriteMutation = useMutation({
		mutationFn: () => toggleProjectFavorite(project.id),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: projectQueryKey });
			const previous = queryClient.getQueryData<Project>(projectQueryKey);
			queryClient.setQueryData<Project>(projectQueryKey, (current) => {
				if (!current) return current;
				return { ...current, is_favorite: !current.is_favorite };
			});
			return { previous };
		},
		onSuccess: async () => {
			const current = queryClient.getQueryData<Project>(projectQueryKey);
			const isFavorite = current?.is_favorite ?? false;
			showAlert(
				isFavorite ? "Added to favorites" : "Removed from favorites",
				"success",
				isFavorite
					? "This project is now marked for quick access."
					: "This project is no longer marked as a favorite.",
			);
			await queryClient.invalidateQueries({ queryKey: projectQueryKey });
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (err, _vars, context) => {
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
	});

	const archiveMutation = useMutation({
		mutationFn: () => toggleProjectArchived(project.id),
		onSuccess: async () => {
			showAlert(
				project.is_archived ? "Project restored" : "Project archived",
				"success",
				project.is_archived
					? "This project is back in your active list."
					: "This project has been moved to archived.",
			);
			await queryClient.invalidateQueries({ queryKey: projectQueryKey });
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (err) => {
			showAlert(
				"Action failed",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating archive status.",
				),
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteProject(project.id),
		onSuccess: async () => {
			showAlert("Project deleted", "success", "The project has been removed.");
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
			navigate("/projects");
		},
		onError: (err) => {
			showAlert(
				"Delete failed",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while deleting this project.",
				),
			);
		},
	});

	const isBusy =
		favoriteMutation.isPending ||
		archiveMutation.isPending ||
		deleteMutation.isPending;

	function handleFavorite() {
		void favoriteMutation.mutate();
	}

	function handleArchive() {
		void archiveMutation.mutate();
	}

	function handleDelete() {
		const confirmed = window.confirm(
			`Delete "${project.title}"? This cannot be undone.`,
		);
		if (!confirmed) return;
		void deleteMutation.mutate();
	}

	return (
		<aside className="space-y-4">
			<h2 className="text-sm font-semibold text-primary">Actions</h2>
			<div className="flex flex-col gap-5">
				<ProjectActionItem
					description={
						project.is_favorite
							? "Remove this project from favorites. It will no longer be highlighted for quick access."
							: "Mark this project for quick access and priority visibility."
					}
					buttonLabel={
						project.is_favorite
							? "Remove from Favorites"
							: "Add to Favorites"
					}
					onClick={handleFavorite}
					disabled={isBusy}
					buttonClassName={actionButtonWarningClass()}
				/>
				<ProjectActionItem
					description={
						project.is_archived
							? "Restore this project to your active list so it appears alongside your current projects again."
							: "Move the project out of your active list without deleting it. You can restore it later."
					}
					buttonLabel={
						project.is_archived ? "Restore Project" : "Archive Project"
					}
					onClick={handleArchive}
					disabled={isBusy}
					buttonClassName={actionButtonPrimaryTintClass()}
				/>
				<ProjectActionItem
					description="Permanently remove this project and its associated data. This action cannot be undone."
					buttonLabel="Delete Project"
					onClick={handleDelete}
					disabled={isBusy}
					buttonClassName={actionButtonDangerClass()}
				/>
			</div>
		</aside>
	);
}

import { useEffect, useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";



import { OutlinedProjectStatusField } from "@/components/project/OutlinedProjectStatusField";
import { ProjectDetailsActions } from "@/components/project/ProjectDetailsActions";

import {

	OutlinedInputField,

	OutlinedReadOnlyField,


	OutlinedTextAreaField,

} from "@/components/ui/OutlinedField";

import Button from "@/components/ui/Button";

import { CustomLoader } from "@/components/ui/CustomLoader";

import { updateProject } from "@/lib/api/projects";

import {

	primaryDetailsFormToUpdatePayload,

	primaryDetailsFormsEqual,

	projectToPrimaryDetailsForm,

	type ProjectPrimaryDetailsForm,

} from "@/lib/project/projectPrimaryDetailsForm";

import { formatProjectDateTime } from "@/lib/project/formatProjectDate";

import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";

import { showAlert } from "@/services/alertService";

import type { Project, ProjectStatus } from "@/types/project";



/** Status, dates, and read-only timestamps — same compact width on desktop. */
const compactDateFieldClass =
	"w-full md:w-fit md:min-w-[13rem] md:max-w-sm";

/** Repository URL — compact on desktop; row may leave space on the right. */
const compactRepoFieldClass =
	"w-full md:w-fit md:min-w-[22rem] md:max-w-2xl";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [

	{ value: "PLANNING", label: "Planning" },

	{ value: "IN_PROGRESS", label: "In progress" },

	{ value: "ON_HOLD", label: "On hold" },

	{ value: "COMPLETED", label: "Completed" },

	{ value: "ABANDONED", label: "Abandoned" },

];



type ProjectPrimaryDetailsProps = {

	project: Project;

};



export function ProjectPrimaryDetails({ project }: ProjectPrimaryDetailsProps) {

	const queryClient = useQueryClient();

	const projectQueryKey = ["project", project.id] as const;



	const [baseline, setBaseline] = useState<ProjectPrimaryDetailsForm>(() =>

		projectToPrimaryDetailsForm(project),

	);

	const [form, setForm] = useState<ProjectPrimaryDetailsForm>(() =>

		projectToPrimaryDetailsForm(project),

	);



	useEffect(() => {

		const next = projectToPrimaryDetailsForm(project);

		setBaseline(next);

		setForm(next);

	}, [

		project.id,

		project.updated_at,

		project.description,

		project.status,

		project.repo_url,

		project.start_date,

		project.end_date,

	]);



	const isDirty = useMemo(

		() => !primaryDetailsFormsEqual(form, baseline),

		[form, baseline],

	);



	const updateMutation = useMutation({

		mutationFn: () =>

			updateProject(project.id, primaryDetailsFormToUpdatePayload(form)),

		onSuccess: async () => {

			showAlert(

				"Project updated",

				"success",

				"Primary details have been saved.",

			);

			await queryClient.invalidateQueries({ queryKey: projectQueryKey });

			await queryClient.invalidateQueries({ queryKey: ["projects"] });

		},

		onError: (err) => {

			showAlert(

				"Update failed",

				"error",

				getRequestErrorMessage(

					err,

					"Something went wrong while updating this project.",

				),

			);

		},

	});



	function patchForm(patch: Partial<ProjectPrimaryDetailsForm>) {

		setForm((current) => ({ ...current, ...patch }));

	}



	function handleCancel() {

		setForm(baseline);

	}



	const actionsDisabled = !isDirty || updateMutation.isPending;



	return (

		<section className="w-full space-y-6">

			<div className="w-full">
				<div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:gap-4">
					<OutlinedReadOnlyField
						label="Created on"
						value={formatProjectDateTime(project.created_at)}
						dateTime={project.created_at}
						className={compactDateFieldClass}
					/>

					<OutlinedReadOnlyField
						label="Last updated on"
						value={formatProjectDateTime(project.updated_at)}
						dateTime={project.updated_at}
						className={compactDateFieldClass}
					/>
				</div>

			</div>



			<div className="w-full space-y-4 border-t border-primary/10 pt-6">
					<h2 className="text-sm font-semibold text-primary">
						Primary Details
					</h2>

					<div className="space-y-4">
						<OutlinedProjectStatusField
							label="Status"
							value={form.status}
							onChange={(status) => patchForm({ status })}
							options={STATUS_OPTIONS}
							className={compactDateFieldClass}
						/>

						<div className="w-full space-y-4 md:w-fit">
							<OutlinedTextAreaField
								label="Description"
								value={form.description}
								onChange={(description) => patchForm({ description })}
								placeholder="Short description (optional)"
								rows={3}
								className="w-full"
							/>

							<div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:gap-4">
								<OutlinedInputField
									label="Repository URL"
									type="url"
									value={form.repoUrl}
									onChange={(repoUrl) => patchForm({ repoUrl })}
									placeholder="https://github.com/org/repo (optional)"
									className={compactRepoFieldClass}
								/>

								<OutlinedInputField
									label="Start date"
									type="date"
									value={form.startDate}
									onChange={(startDate) => patchForm({ startDate })}
									className={compactDateFieldClass}
								/>

								<OutlinedInputField
									label="End date"
									type="date"
									value={form.endDate}
									onChange={(endDate) => patchForm({ endDate })}
									className={compactDateFieldClass}
								/>
							</div>
						</div>
					</div>



					<div className="flex flex-wrap items-center gap-2 pt-1">

						<Button

							type="button"

							title="Update"

							variant="primary"

							className="w-auto"

							disabled={actionsDisabled}

							loading={updateMutation.isPending}

							onClick={() => updateMutation.mutate()}

							loader={

								<CustomLoader

									size={16}

									color="#ffffff"

									containerStyle={{ width: 16, height: 16 }}

									aria-label="Saving project details"

								/>

							}

						/>

						<Button

							type="button"

							title="Cancel"

							variant="secondary"

							className="w-auto"

							disabled={actionsDisabled}

							onClick={handleCancel}

						/>

					</div>
			</div>

			<div className="w-full border-t border-primary/10 pt-6">
				<ProjectDetailsActions project={project} />
			</div>

		</section>

	);

}



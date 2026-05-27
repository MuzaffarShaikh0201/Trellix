import type { Project, ProjectStatus } from "@/types/project";

export type ProjectPrimaryDetailsForm = {
	title: string;
	description: string;
	status: ProjectStatus;
	repoUrl: string;
	startDate: string;
	endDate: string;
};

export function toDateInputValue(value: string | null): string {
	if (!value) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateInputValue(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function projectToPrimaryDetailsForm(
	project: Project,
): ProjectPrimaryDetailsForm {
	return {
		title: project.title,
		description: project.description ?? "",
		status: project.status,
		repoUrl: project.repo_url ?? "",
		startDate: toDateInputValue(project.start_date),
		endDate: toDateInputValue(project.end_date),
	};
}

export function primaryDetailsFormsEqual(
	a: ProjectPrimaryDetailsForm,
	b: ProjectPrimaryDetailsForm,
): boolean {
	return (
		a.title === b.title &&
		a.description === b.description &&
		a.status === b.status &&
		a.repoUrl === b.repoUrl &&
		a.startDate === b.startDate &&
		a.endDate === b.endDate
	);
}

export function primaryDetailsFormToUpdatePayload(
	form: ProjectPrimaryDetailsForm,
) {
	return {
		title: form.title.trim() || null,
		description: form.description.trim() || null,
		status: form.status,
		repo_url: form.repoUrl.trim() || null,
		start_date: fromDateInputValue(form.startDate),
		end_date: fromDateInputValue(form.endDate),
	};
}

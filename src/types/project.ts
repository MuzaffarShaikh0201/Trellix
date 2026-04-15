export type ProjectStatus =
	| "ACTIVE"
	| "PENDING"
	| "ON_HOLD"
	| "COMPLETED"
	| "CANCELLED"
	| "ARCHIVED";

export type ProjectCategory =
	| "WORK"
	| "PERSONAL"
	| "LEARNING"
	| "HEALTH"
	| "FINANCE"
	| "SIDE_PROJECT"
	| "CREATIVE"
	| "TRAVEL"
	| "HOME"
	| "OTHER";

export type ProjectSortBy = "title" | "created_at" | "updated_at";
export type ProjectSortOrder = "asc" | "desc";

export type Project = {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	status: ProjectStatus;
	category: ProjectCategory;
	start_date: string | null;
	due_date: string | null;
	completed_at: string | null;
	color: string | null;
	is_favorite: boolean;
	created_at: string;
	updated_at: string;
};

export type GetProjectsParams = {
	status?: ProjectStatus;
	category?: ProjectCategory;
	is_favorite?: boolean;
	page?: number;
	limit?: number;
	sort_by?: ProjectSortBy;
	sort_order?: ProjectSortOrder;
};

export type GetProjectsResponse = {
	projects: Project[];
	total_pages: number;
	total_items: number;
	current_page: number;
	items_per_page: number;
};

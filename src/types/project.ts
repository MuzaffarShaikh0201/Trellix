export type ProjectStatus =
	| "PLANNING"
	| "IN_PROGRESS"
	| "ON_HOLD"
	| "COMPLETED"
	| "ABANDONED";

export type ProjectSortBy =
	| "title"
	| "created_at"
	| "updated_at"
	| "start_date"
	| "end_date";

export type ProjectSortOrder = "asc" | "desc";

export type Project = {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	status: ProjectStatus;
	repo_url: string | null;
	start_date: string | null;
	end_date: string | null;
	color: string | null;
	is_favorite: boolean;
	is_archived: boolean;
	created_at: string;
	updated_at: string;
};

export type GetProjectsParams = {
	status?: ProjectStatus;
	is_favorite?: boolean;
	is_archived?: boolean;
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

/** Summary row from GET /project/recent (up to 5, by updated_at). */
export type RecentProjectItem = {
	id: string;
	title: string;
	is_favorite: boolean;
	status: ProjectStatus;
	created_at: string;
	updated_at: string;
};

export type GetRecentProjectsResponse = {
	projects: RecentProjectItem[];
};

export type CreateProjectParams = {
	title: string;
	description?: string | null;
	start_date?: string | null;
	end_date?: string | null;
	color?: string | null;
	repo_url?: string | null;
};

export type CreateProjectResponse = {
	project_id: string;
};

export type UpdateProjectParams = {
	title?: string | null;
	description?: string | null;
	status?: ProjectStatus | null;
	start_date?: string | null;
	end_date?: string | null;
	color?: string | null;
	repo_url?: string | null;
	is_archived?: boolean | null;
};

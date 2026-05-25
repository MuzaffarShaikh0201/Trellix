import type { RecentProjectItem } from "@/types/project";

export function getRecentProjectId(project: RecentProjectItem): string {
	return project.id;
}

export const RECENT_PROJECTS_ROW_COUNT = 5;

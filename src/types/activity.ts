export type ActivityChange = { field: string; from: unknown; to: unknown };

export type ActivityEvent =
	| { type: "project.created"; data: { title?: string } }
	| { type: "project.updated"; data: { changes: ActivityChange[] } }
	| { type: "project.archived" | "project.restored"; data: Record<string, never> }
	| {
			type: "note.created" | "note.updated" | "note.deleted";
			data: { note_id: string; title: string };
	  }
	| {
			type: "task.created" | "task.completed" | "task.deleted";
			data: { task_id: string; title: string };
	  };

export type ActivityItem = ActivityEvent & {
	id: string;
	project_id: string;
	user_id: string;
	created_at: string;
};

export type GetActivityResponse = {
	events: ActivityItem[];
	total_pages: number;
	total_items: number;
	current_page: number;
	items_per_page: number;
};

export type NotificationType = "DEADLINE_SOON" | "OVERDUE" | "TASK_DUE_SOON" | "TASK_OVERDUE";

export type AppNotification = {
	id: string;
	type: NotificationType;
	/** For task notifications, the task's project. */
	project: { id: string; title: string };
	/** Set on TASK_* notifications, null on project ones. */
	task?: { id: string; title: string } | null;
	due_date: string;
	message: string;
	is_read: boolean;
	read_at: string | null;
	created_at: string;
};

export type GetNotificationsResponse = {
	notifications: AppNotification[];
	unread_count: number;
	total_pages: number;
	total_items: number;
	current_page: number;
	items_per_page: number;
};

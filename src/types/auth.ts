export type AuthType = "email" | "oauth";

export type AuthSession = {
	access_token: string;
	refresh_token: string;
	session_id: string;
};

export type User = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	auth_type: AuthType;
	is_active: boolean;
	last_logged_in: string;
	created_at: string;
	updated_at: string;
};

export type MessageResponse = {
	message: string;
};

export type RegisterParams = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
};

export type LoginParams = {
	email: string;
	password: string;
};

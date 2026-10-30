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
	/** Only verified emails can receive password reset links. */
	is_email_verified?: boolean;
	email_verified_at?: string | null;
	last_logged_in: string;
	created_at: string;
	updated_at: string;
};

export type MessageResponse = {
	message: string;
};

export type RegisterResponse = MessageResponse & {
	/** When the verification link expires; null if the link could not be created. */
	email_verification_expires_at?: string | null;
};

export type ResendVerificationResponse = MessageResponse & {
	/** When a link sent now would expire (returned even if nothing was sent). */
	expires_at: string;
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

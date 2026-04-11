import { createContext } from "react";

import type { LoginParams, MessageResponse, RegisterParams, User } from "@/types/auth";

export type AuthContextValue = {
	user: User | null;
	/**
	 * True when a full session exists in storage (access + refresh + session id).
	 * The access token is treated as valid until an authenticated API call returns 401 after a failed refresh.
	 */
	isAuthenticated: boolean;
	login: (params: LoginParams) => Promise<void>;
	logout: () => Promise<void>;
	register: (params: RegisterParams) => Promise<MessageResponse>;
	refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

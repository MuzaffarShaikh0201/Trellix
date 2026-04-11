import { createContext } from "react";

import type { LoginParams, MessageResponse, RegisterParams, User } from "@/types/auth";

export type AuthContextValue = {
	user: User | null;
	isAuthenticated: boolean;
	/** False until the initial session check (localStorage + `/user`) finishes. */
	isReady: boolean;
	login: (params: LoginParams) => Promise<void>;
	logout: () => Promise<void>;
	register: (params: RegisterParams) => Promise<MessageResponse>;
	refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

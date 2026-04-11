import { useQueryClient } from "@tanstack/react-query";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { AuthContext } from "@/contexts/auth/auth-context";
import { loginUser, logoutUser, refreshTokens, registerUser } from "@/lib/api/auth";
import { fetchCurrentUser } from "@/lib/api/user";
import {
	clearAuthSession,
	readAuthSession,
	setAuthSession,
} from "@/lib/auth/storage";
import type { LoginParams, RegisterParams, User } from "@/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const ac = new AbortController();

		if (!readAuthSession()) {
			setIsReady(true);
			return () => ac.abort();
		}

		fetchCurrentUser({ signal: ac.signal })
			.then(setUser)
			.catch(() => {
				clearAuthSession();
				setUser(null);
			})
			.finally(() => {
				if (!ac.signal.aborted) setIsReady(true);
			});

		return () => ac.abort();
	}, []);

	const login = useCallback(
		async (params: LoginParams) => {
			const session = await loginUser(params);
			setAuthSession(session);
			const u = await fetchCurrentUser();
			setUser(u);
			await queryClient.invalidateQueries();
		},
		[queryClient],
	);

	const logout = useCallback(async () => {
		try {
			await logoutUser();
		} catch {
			/* session may already be invalid */
		} finally {
			clearAuthSession();
			setUser(null);
			queryClient.clear();
		}
	}, [queryClient]);

	const register = useCallback(async (params: RegisterParams) => {
		return registerUser(params);
	}, []);

	const refreshSession = useCallback(async () => {
		const stored = readAuthSession();
		if (!stored?.refresh_token) {
			clearAuthSession();
			setUser(null);
			return;
		}
		try {
			const session = await refreshTokens(stored.refresh_token);
			setAuthSession(session);
			const u = await fetchCurrentUser();
			setUser(u);
			await queryClient.invalidateQueries();
		} catch {
			clearAuthSession();
			setUser(null);
			queryClient.clear();
		}
	}, [queryClient]);

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: user !== null,
			isReady,
			login,
			logout,
			register,
			refreshSession,
		}),
		[user, isReady, login, logout, register, refreshSession],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

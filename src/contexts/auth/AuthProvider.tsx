import { useQueryClient } from "@tanstack/react-query";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { useNavigate } from "react-router";

import { AuthContext } from "@/contexts/auth/auth-context";
import { loginUser, logoutUser, refreshTokens, registerUser } from "@/lib/api/auth";
import { setSessionExpiredNotifier } from "@/lib/auth/session-expired";
import { fetchCurrentUser } from "@/lib/api/user";
import { AUTH_ROUTE_PATHS } from "@/lib/auth/auth-routes";
import {
	clearAuthSession,
	getStoredAccessToken,
	readAuthSession,
	setAuthSession,
} from "@/lib/auth/storage";
import { showAlert } from "@/services/alertService";
import type { LoginParams, RegisterParams, User } from "@/types/auth";

function isAbortError(err: unknown): boolean {
	if (err instanceof DOMException && err.name === "AbortError") return true;
	if (err instanceof Error && err.name === "AbortError") return true;
	return false;
}

function readInitialHasSession(): boolean {
	try {
		if (!getStoredAccessToken()) {
			clearAuthSession();
			return false;
		}
		if (!readAuthSession()) {
			clearAuthSession();
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [hasSession, setHasSession] = useState(readInitialHasSession);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		setSessionExpiredNotifier(() => {
			setHasSession(false);
			setUser(null);
			queryClient.clear();
			showAlert(
				"Session expired",
				"warning",
				"Your session has expired. Please log in again.",
			);
			const path = window.location.pathname;
			if (!AUTH_ROUTE_PATHS.has(path)) {
				const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
				navigate(
					`/login?redirectTo=${encodeURIComponent(returnPath)}`,
					{ replace: true },
				);
			}
		});
		return () => setSessionExpiredNotifier(null);
	}, [navigate, queryClient]);

	useEffect(() => {
		if (!hasSession) {
			setUser(null);
			return;
		}

		const ac = new AbortController();
		void fetchCurrentUser({ signal: ac.signal })
			.then((u) => {
				if (!ac.signal.aborted) {
					setUser(u);
				}
			})
			.catch((err: unknown) => {
				if (ac.signal.aborted || isAbortError(err)) {
					return;
				}
				/* Keep session; token stays valid until a 401 from the API client. */
			});

		return () => ac.abort();
	}, [hasSession]);

	const login = useCallback(
		async (params: LoginParams) => {
			const session = await loginUser(params);
			setAuthSession(session);
			setHasSession(true);
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
			setHasSession(false);
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
			setHasSession(false);
			setUser(null);
			return;
		}
		const wasAuthenticated = hasSession;
		try {
			const session = await refreshTokens(stored.refresh_token);
			setAuthSession(session);
			setHasSession(true);
			if (wasAuthenticated) {
				const u = await fetchCurrentUser();
				setUser(u);
			}
			await queryClient.invalidateQueries();
		} catch {
			clearAuthSession();
			setHasSession(false);
			setUser(null);
			queryClient.clear();
		}
	}, [queryClient, hasSession]);

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: hasSession,
			login,
			logout,
			register,
			refreshSession,
		}),
		[user, hasSession, login, logout, register, refreshSession],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

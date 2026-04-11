import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "@/contexts/auth";

type ProtectedRouteProps = {
	children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		const returnPath = `${location.pathname}${location.search}${location.hash}`;
		const loginUrl = `/login?redirectTo=${encodeURIComponent(returnPath)}`;
		return <Navigate to={loginUrl} replace />;
	}

	return <>{children}</>;
}

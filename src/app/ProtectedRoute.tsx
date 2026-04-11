import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { CustomLoader } from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts/auth";

type ProtectedRouteProps = {
	children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isReady } = useAuth();
	const location = useLocation();

	if (!isReady) {
		return (
			<div
				className="flex min-h-dvh items-center justify-center bg-background-primary"
				aria-busy="true"
				aria-label="Loading session"
			>
				<CustomLoader />
			</div>
		);
	}

	if (!isAuthenticated) {
		const returnPath = `${location.pathname}${location.search}${location.hash}`;
		const loginUrl = `/login?redirectTo=${encodeURIComponent(returnPath)}`;
		return <Navigate to={loginUrl} replace />;
	}

	return <>{children}</>;
}

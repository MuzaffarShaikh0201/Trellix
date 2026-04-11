import type { ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router";

import { useAuth } from "@/contexts/auth";
import { safeAppRedirectTarget } from "@/lib/auth/auth-routes";

type GuestOnlyRouteProps = {
	children: ReactNode;
};

/**
 * If a session exists in storage, skip auth screens and continue into the app.
 */
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
	const { isAuthenticated } = useAuth();
	const [searchParams] = useSearchParams();

	if (isAuthenticated) {
		const next = safeAppRedirectTarget(searchParams.get("redirectTo"));
		return <Navigate to={next} replace />;
	}

	return <>{children}</>;
}

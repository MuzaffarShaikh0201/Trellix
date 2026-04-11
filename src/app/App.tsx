import { Routes, Route, Navigate } from "react-router";
import { GuestOnlyRoute } from "@/app/GuestOnlyRoute";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import {
	NotFoundPage,
	ServerErrorPage,
	ServiceUnavailablePage,
} from "@/pages/HttpErrorPages";
import { LegalInfoPage } from "@/pages/LegalInfoPage";

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route path="/legal" element={<LegalInfoPage />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Navigate to="/" replace />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/login"
				element={
					<GuestOnlyRoute>
						<AuthPage />
					</GuestOnlyRoute>
				}
			/>
			<Route
				path="/signup"
				element={
					<GuestOnlyRoute>
						<AuthPage />
					</GuestOnlyRoute>
				}
			/>
			<Route
				path="/forgot-password"
				element={
					<GuestOnlyRoute>
						<AuthPage />
					</GuestOnlyRoute>
				}
			/>
			<Route path="/500" element={<ServerErrorPage />} />
			<Route path="/503" element={<ServiceUnavailablePage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}

export default App;

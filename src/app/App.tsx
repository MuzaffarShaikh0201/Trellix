import { Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
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
			<Route path="/login" element={<AuthPage />} />
			<Route path="/signup" element={<AuthPage />} />
			<Route path="/forgot-password" element={<AuthPage />} />
		</Routes>
	);
}

export default App;

import { Routes, Route, Navigate } from "react-router";
import { GuestOnlyRoute } from "@/app/GuestOnlyRoute";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SectionPlaceholderPage } from "@/pages/SectionPlaceholderPage";
import {
	NotFoundPage,
	ServerErrorPage,
	ServiceUnavailablePage,
} from "@/pages/HttpErrorPages";
import { ContactPage } from "@/pages/ContactPage";
import { LegalInfoPage } from "@/pages/LegalInfoPage";

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<AppShell />
					</ProtectedRoute>
				}
			>
				<Route index element={<DashboardPage />} />
				<Route
					path="projects"
					element={<SectionPlaceholderPage title="Projects" />}
				/>
				<Route
					path="tasks"
					element={<SectionPlaceholderPage title="Tasks" />}
				/>
				<Route
					path="calendar"
					element={<SectionPlaceholderPage title="Calendar" />}
				/>
				<Route
					path="notes"
					element={<SectionPlaceholderPage title="Notes" />}
				/>
				<Route
					path="habits"
					element={<SectionPlaceholderPage title="Habits" />}
				/>
				<Route
					path="settings"
					element={<SectionPlaceholderPage title="Settings" />}
				/>
				<Route
					path="profile"
					element={<SectionPlaceholderPage title="Your profile" />}
				/>
				<Route path="contact" element={<ContactPage />} />
			</Route>
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

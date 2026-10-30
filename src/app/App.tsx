import { Routes, Route, Navigate } from "react-router";
import { GuestOnlyRoute } from "@/app/GuestOnlyRoute";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { NotePage } from "@/pages/NotePage";
import { NotesPage } from "@/pages/NotesPage";
import { CreateNotePage } from "@/pages/CreateNotePage";
import { CalendarPage } from "@/pages/CalendarPage";
import {
	NotFoundPage,
	ServerErrorPage,
	ServiceUnavailablePage,
} from "@/pages/HttpErrorPages";
import { ContactPage } from "@/pages/ContactPage";
import { LegalInfoPage } from "@/pages/LegalInfoPage";
import { ForgotPasswordPage, ResetPasswordPage } from "@/pages/PasswordPages";
import { SettingsPage } from "@/pages/SettingsPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";

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
				<Route path="projects" element={<ProjectsPage />} />
				<Route path="projects/:projectId" element={<ProjectPage />} />
				<Route path="calendar" element={<CalendarPage />} />
				<Route path="notes" element={<NotesPage />} />
				<Route path="notes/new" element={<CreateNotePage />} />
				<Route path="notes/:noteId" element={<NotePage />} />
				<Route path="settings" element={<Navigate to="/settings/profile" replace />} />
				<Route path="settings/:section" element={<SettingsPage />} />
				<Route path="profile" element={<Navigate to="/settings/profile" replace />} />
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
						<ForgotPasswordPage />
					</GuestOnlyRoute>
				}
			/>
			{/* Public: the emailed link must work even if a session exists in this browser. */}
			<Route path="/reset-password" element={<ResetPasswordPage />} />
			<Route path="/verify-email" element={<VerifyEmailPage />} />
			<Route path="/500" element={<ServerErrorPage />} />
			<Route path="/503" element={<ServiceUnavailablePage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}

export default App;

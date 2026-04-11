import { Link, useLocation } from "react-router";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
function AuthFormForPath({ pathname }: { pathname: string }) {
	if (pathname === "/signup") return <SignupForm />;
	if (pathname === "/forgot-password") return <ForgotPasswordForm />;
	return <LoginForm />;
}

function AuthFormNav({ pathname }: { pathname: string }) {
	const linkClass =
		"text-sm text-text-secondary underline-offset-4 hover:underline";

	return (
		<nav
			className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-tint pt-6"
			aria-label="Auth navigation"
		>
			{pathname !== "/login" && (
				<Link to="/login" className={linkClass}>
					Login
				</Link>
			)}
			{pathname !== "/signup" && (
				<Link to="/signup" className={linkClass}>
					Sign up
				</Link>
			)}
			{pathname !== "/forgot-password" && (
				<Link to="/forgot-password" className={linkClass}>
					Forgot password
				</Link>
			)}
			<Link to="/" className={linkClass}>
				Home
			</Link>
		</nav>
	);
}

function authSectionLabel(pathname: string) {
	if (pathname === "/signup") return "Sign up form";
	if (pathname === "/forgot-password") return "Forgot password form";
	return "Login form";
}

export function AuthPage() {
	const { pathname } = useLocation();

	return (
		<div className="flex min-h-dvh w-full bg-background-primary">
			<aside
				className="hidden h-dvh w-[70%] shrink-0 lg:flex lg:flex-col"
				aria-label="Trellix branding"
			>
				<AuthLayout />
			</aside>

			<main className="flex min-h-dvh w-full flex-col bg-background-secondary lg:w-[30%] lg:min-h-dvh lg:justify-center">
				<div
					className={
						pathname === "/login" ||
						pathname === "/signup" ||
						pathname === "/forgot-password"
							? "mx-auto flex h-full min-h-dvh w-full max-w-md flex-1 flex-col px-4 py-6 lg:min-h-0 lg:px-6 lg:py-10"
							: "mx-auto w-full max-w-md px-6 py-10"
					}
				>
					{pathname === "/login" ||
					pathname === "/signup" ||
					pathname === "/forgot-password" ? (
						<div
							className="flex min-h-0 flex-1 flex-col"
							aria-label={authSectionLabel(pathname)}
						>
							<AuthFormForPath pathname={pathname} />
						</div>
					) : (
						<>
							<section
								className="rounded-xl border border-tint bg-tint/30 p-6 shadow-sm"
								aria-label={authSectionLabel(pathname)}
							>
								<AuthFormForPath pathname={pathname} />
							</section>
							<AuthFormNav pathname={pathname} />
						</>
					)}
				</div>
			</main>
		</div>
	);
}

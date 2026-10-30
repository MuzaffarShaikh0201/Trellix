import { useLocation } from "react-router";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

export function AuthPage() {
	const { pathname } = useLocation();
	return <AuthLayout>{pathname === "/signup" ? <SignupForm /> : <LoginForm />}</AuthLayout>;
}

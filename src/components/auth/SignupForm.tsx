import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LuArrowRight, LuLock, LuMail } from "react-icons/lu";

import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import { VerifyEmailNotice } from "@/components/auth/VerifyEmailNotice";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useAuth } from "@/contexts/auth";
import { safeAppRedirectTarget } from "@/lib/auth/auth-routes";
import { PASSWORD_MAX, firstFailedRule } from "@/lib/auth/passwordRules";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

export function SignupForm() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [verification, setVerification] = useState<{ email: string; expiresAt: string | null } | null>(null);
	const [searchParams] = useSearchParams();
	const redirectTo = safeAppRedirectTarget(searchParams.get("redirectTo"));
	const navigate = useNavigate();
	const { register, login } = useAuth();

	const mismatch = Boolean(confirm && confirm !== password);

	async function handleSignUp(e: FormEvent) {
		e.preventDefault();
		if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirm) {
			showAlert("Missing details", "warning", "Please fill in every field.");
			return;
		}
		const failed = firstFailedRule(password);
		if (failed) {
			showAlert("Password too weak", "warning", `Your password needs: ${failed.label.toLowerCase()}.`);
			return;
		}
		if (password !== confirm) {
			showAlert("Passwords don’t match", "warning", "Re-type the same password in both fields.");
			return;
		}
		setLoading(true);
		try {
			const res = await register({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim(), password });
			// Show the "verify your email" note before signing in; signing in would leave this page.
			setVerification({ email: email.trim(), expiresAt: res.email_verification_expires_at ?? null });
		} catch (error) {
			showAlert("Sign up failed", "error", getRequestErrorMessage(error, "Something went wrong. Please try again."));
		} finally {
			setLoading(false);
		}
	}

	async function continueToApp() {
		if (!verification) return;
		setLoading(true);
		try {
			await login({ email: verification.email, password });
			showAlert("Welcome to Trellix", "success", "Your account is ready.");
			navigate(redirectTo, { replace: true });
		} catch (error) {
			// The account exists, so send them to log in rather than signing up again.
			showAlert("Please log in", "warning", getRequestErrorMessage(error, "Your account was created. Log in to continue."));
			navigate("/login", { replace: true });
		} finally {
			setLoading(false);
		}
	}

	if (verification) {
		return (
			<VerifyEmailNotice
				email={verification.email}
				expiresAt={verification.expiresAt}
				onContinue={() => void continueToApp()}
				continuing={loading}
			/>
		);
	}

	return (
		<>
			<h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
			<p className="mt-1.5 text-sm text-muted">Start organizing your dev work in under a minute.</p>
			<div className="mt-7">
				<GoogleButton disabled={loading} />
			</div>
			<OrDivider />
			<form onSubmit={handleSignUp} className="space-y-4" noValidate>
				<div className="grid grid-cols-2 gap-3">
					<TextField
						label="First name"
						placeholder="Ada"
						autoComplete="given-name"
						autoFocus
						maxLength={32}
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<TextField
						label="Last name"
						placeholder="Lovelace"
						autoComplete="family-name"
						maxLength={32}
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>
				<TextField
					label="Email"
					type="email"
					icon={<LuMail />}
					placeholder="you@company.com"
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<div>
					<TextField
						label="Password"
						type="password"
						icon={<LuLock />}
						placeholder="••••••••"
						autoComplete="new-password"
						maxLength={PASSWORD_MAX}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<PasswordChecklist password={password} />
				</div>
				<TextField
					label="Confirm password"
					type="password"
					icon={<LuLock />}
					placeholder="••••••••"
					autoComplete="new-password"
					maxLength={PASSWORD_MAX}
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					hint={mismatch ? <span className="text-red-600 dark:text-red-400">Passwords don’t match.</span> : undefined}
				/>
				<Button type="submit" className="w-full py-2.5" loading={loading}>
					Create account
					{loading ? null : <LuArrowRight className="size-4" />}
				</Button>
			</form>
			<p className="mt-6 text-center text-sm text-muted">
				Already have an account?{" "}
				<Link to={`/login${searchParams.toString() ? `?${searchParams}` : ""}`} className="font-medium text-primary hover:underline">
					Log in
				</Link>
			</p>
		</>
	);
}

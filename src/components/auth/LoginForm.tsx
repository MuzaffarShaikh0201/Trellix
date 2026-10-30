import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LuArrowRight, LuLock, LuMail } from "react-icons/lu";

import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useAuth } from "@/contexts/auth";
import { formatWait, useCooldown } from "@/hooks/useCooldown";
import { safeAppRedirectTarget } from "@/lib/auth/auth-routes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [searchParams] = useSearchParams();
	const redirectTo = safeAppRedirectTarget(searchParams.get("redirectTo"));
	const navigate = useNavigate();
	const { login } = useAuth();
	const cooldown = useCooldown();

	async function handleLogin(e: FormEvent) {
		e.preventDefault();
		if (!email.trim() || !password) {
			showAlert("Missing details", "warning", "Enter your email and password.");
			return;
		}
		setLoading(true);
		try {
			await login({ email: email.trim(), password });
			navigate(redirectTo, { replace: true });
		} catch (error) {
			// After too many failed attempts even the right password is refused until the wait ends.
			const limited = cooldown.startFrom(error);
			showAlert(
				limited ? "Too many attempts" : "Login failed",
				"error",
				getRequestErrorMessage(error, "Invalid credentials. Please try again."),
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
			<p className="mt-1.5 text-sm text-muted">Log in to pick up where you left off.</p>
			<div className="mt-7">
				<GoogleButton disabled={loading} />
			</div>
			<OrDivider />
			<form onSubmit={handleLogin} className="space-y-4" noValidate>
				<TextField
					label="Email"
					type="email"
					icon={<LuMail />}
					placeholder="you@company.com"
					autoComplete="email"
					autoFocus
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<TextField
					label="Password"
					type="password"
					icon={<LuLock />}
					placeholder="••••••••"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<div className="-mt-2 flex justify-end">
					<Link
						to={`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ""}`}
						className="text-xs font-medium text-primary hover:underline"
					>
						Forgot password?
					</Link>
				</div>
				<Button type="submit" className="w-full py-2.5" loading={loading} disabled={cooldown.waiting}>
					{cooldown.waiting ? (
						`Try again in ${formatWait(cooldown.secondsLeft)}`
					) : (
						<>
							Log in
							{loading ? null : <LuArrowRight className="size-4" />}
						</>
					)}
				</Button>
			</form>
			<p className="mt-6 text-center text-sm text-muted">
				New to Trellix?{" "}
				<Link to={`/signup${searchParams.toString() ? `?${searchParams}` : ""}`} className="font-medium text-primary hover:underline">
					Create an account
				</Link>
			</p>
		</>
	);
}

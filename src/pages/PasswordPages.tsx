import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LuArrowLeft, LuKeyRound, LuLock, LuMail, LuMailCheck } from "react-icons/lu";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import Button from "@/components/ui/Button";
import { buttonPrimaryClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/Field";
import { useAuth } from "@/contexts/auth";
import { formatWait, useCooldown } from "@/hooks/useCooldown";
import { requestPasswordReset, resetPassword } from "@/lib/api/activity";
import { resendVerificationEmail } from "@/lib/api/auth";
import { PASSWORD_MAX, firstFailedRule } from "@/lib/auth/passwordRules";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { formatDateTime } from "@/lib/project/projectDisplay";
import { showAlert } from "@/services/alertService";
import { ApiError } from "@/types/api";

function BackToLogin() {
	return (
		<Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
			<LuArrowLeft className="size-4" />
			Back to log in
		</Link>
	);
}

function IconBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:size-5">
			{children}
		</span>
	);
}

/** Sends a verification link for an email that may not be verified yet. */
function VerifyLinkButton({ email }: { email: string }) {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [expiresAt, setExpiresAt] = useState<string | null>(null);
	const cooldown = useCooldown();

	async function send() {
		setState("sending");
		try {
			const res = await resendVerificationEmail(email);
			setExpiresAt(res.expires_at);
			setState("sent");
		} catch (err) {
			setState("idle");
			cooldown.startFrom(err);
			showAlert("Could not send the link", "error", getRequestErrorMessage(err, "Please try again."));
		}
	}

	if (state === "sent") {
		return (
			<p className="mt-2 font-medium text-fg">
				If that email isn’t verified yet, a verification link is on its way. It expires {formatDateTime(expiresAt)}.
			</p>
		);
	}
	return (
		<button
			type="button"
			onClick={() => void send()}
			disabled={state === "sending" || cooldown.waiting}
			className="mt-2 block cursor-pointer font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
		>
			{state === "sending"
				? "Sending…"
				: cooldown.waiting
					? `Try again in ${formatWait(cooldown.secondsLeft)}`
					: "Send me a verification link"}
		</button>
	);
}

/** /forgot-password: ask for an email; the API always answers the same way. */
export function ForgotPasswordPage() {
	const [sp] = useSearchParams();
	const [email, setEmail] = useState(sp.get("email") ?? "");
	const [loading, setLoading] = useState(false);
	const [sentTo, setSentTo] = useState<string | null>(null);
	const cooldown = useCooldown();

	async function submit(e: FormEvent) {
		e.preventDefault();
		const value = email.trim();
		if (!value) {
			showAlert("Email required", "warning", "Enter the email you signed up with.");
			return;
		}
		setLoading(true);
		try {
			await requestPasswordReset(value);
			setSentTo(value);
		} catch (err) {
			cooldown.startFrom(err);
			showAlert("Could not send the link", "error", getRequestErrorMessage(err, "Check the email address and try again."));
		} finally {
			setLoading(false);
		}
	}

	if (sentTo) {
		return (
			<AuthLayout>
				<IconBadge>
					<LuMailCheck />
				</IconBadge>
				<h1 className="mt-5 text-2xl font-semibold tracking-tight">Check your email</h1>
				<p className="mt-2 text-sm leading-relaxed text-muted">
					If <span className="font-medium text-fg">{sentTo}</span> belongs to an account with a verified email, we’ve sent a link to reset
					your password. It works once and expires in 30 minutes.
				</p>
				<div className="mt-5 rounded-xl border border-line bg-surface-2/50 p-3 text-xs leading-relaxed text-muted">
					Reset links are only sent to <span className="font-medium text-fg">verified</span> emails. If you never
					verified yours, verify it first, then request a reset again.
					<VerifyLinkButton email={sentTo} />
				</div>
				<p className="mt-4 text-sm text-muted">
					Didn’t get it? Check your spam folder, or{" "}
					<button type="button" onClick={() => setSentTo(null)} className="cursor-pointer font-medium text-primary hover:underline">
						try again
					</button>
					.
				</p>
				<BackToLogin />
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<IconBadge>
				<LuKeyRound />
			</IconBadge>
			<h1 className="mt-5 text-2xl font-semibold tracking-tight">Forgot your password?</h1>
			<p className="mt-1.5 text-sm text-muted">Enter your email and we’ll send you a link to set a new one.</p>
			<form onSubmit={submit} className="mt-7 space-y-4" noValidate>
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
				<Button type="submit" className="w-full py-2.5" loading={loading} disabled={cooldown.waiting}>
					{cooldown.waiting ? `Try again in ${formatWait(cooldown.secondsLeft)}` : "Send reset link"}
				</Button>
			</form>
			<BackToLogin />
		</AuthLayout>
	);
}

/** /reset-password?token=…: the link from the email. */
export function ResetPasswordPage() {
	const [sp] = useSearchParams();
	const token = sp.get("token") ?? "";
	const navigate = useNavigate();
	const { isAuthenticated, logout } = useAuth();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [badLink, setBadLink] = useState(!token);
	const mismatch = Boolean(confirm && confirm !== password);

	async function submit(e: FormEvent) {
		e.preventDefault();
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
			await resetPassword(token, password);
			// The reset signs out existing sessions, so drop any local one too.
			if (isAuthenticated) await logout().catch(() => {});
			showAlert("Password updated", "success", "Log in with your new password.");
			navigate("/login", { replace: true });
		} catch (err) {
			if (err instanceof ApiError && err.status === 400) setBadLink(true);
			else showAlert("Could not reset password", "error", getRequestErrorMessage(err, "Please try again."));
		} finally {
			setLoading(false);
		}
	}

	if (badLink) {
		return (
			<AuthLayout>
				<IconBadge>
					<LuKeyRound />
				</IconBadge>
				<h1 className="mt-5 text-2xl font-semibold tracking-tight">This link doesn’t work</h1>
				<p className="mt-2 text-sm leading-relaxed text-muted">
					Reset links work once and expire after 30 minutes. Request a new one to continue.
				</p>
				<Link to="/forgot-password" className={buttonPrimaryClass("mt-6 w-full py-2.5")}>
					Request a new link
				</Link>
				<BackToLogin />
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<IconBadge>
				<LuLock />
			</IconBadge>
			<h1 className="mt-5 text-2xl font-semibold tracking-tight">Set a new password</h1>
			<p className="mt-1.5 text-sm text-muted">You’ll be asked to log in again afterwards.</p>
			<form onSubmit={submit} className="mt-7 space-y-4" noValidate>
				<div>
					<TextField
						label="New password"
						type="password"
						icon={<LuLock />}
						autoComplete="new-password"
						autoFocus
						maxLength={PASSWORD_MAX}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<PasswordChecklist password={password} />
				</div>
				<TextField
					label="Confirm new password"
					type="password"
					icon={<LuLock />}
					autoComplete="new-password"
					maxLength={PASSWORD_MAX}
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					hint={mismatch ? <span className="text-red-600 dark:text-red-400">Passwords don’t match.</span> : undefined}
				/>
				<Button type="submit" className="w-full py-2.5" loading={loading}>
					Update password
				</Button>
			</form>
			<BackToLogin />
		</AuthLayout>
	);
}

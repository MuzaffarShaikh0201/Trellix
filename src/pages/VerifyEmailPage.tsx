import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { LuCircleCheck, LuMail, LuMailX } from "react-icons/lu";

import { AuthLayout } from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import { buttonPrimaryClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/auth";
import { formatWait, useCooldown } from "@/hooks/useCooldown";
import { resendVerificationEmail, verifyEmail } from "@/lib/api/auth";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { formatDateTime } from "@/lib/project/projectDisplay";
import { showAlert } from "@/services/alertService";
import { ApiError } from "@/types/api";

type State = "verifying" | "verified" | "invalid" | "error";

/** /verify-email?token=…: the link from the verification email. Works signed in or out. */
export function VerifyEmailPage() {
	const [sp] = useSearchParams();
	const token = sp.get("token") ?? "";
	const { isAuthenticated, user, reloadUser } = useAuth();
	const [state, setState] = useState<State>(token ? "verifying" : "invalid");
	const [errorMessage, setErrorMessage] = useState("");
	// Tokens are single use; make sure the request only runs once (React runs effects twice in dev).
	const started = useRef(false);

	useEffect(() => {
		if (!token || started.current) return;
		started.current = true;
		verifyEmail(token)
			.then(async () => {
				setState("verified");
				if (isAuthenticated) await reloadUser().catch(() => {});
			})
			.catch((err) => {
				if (err instanceof ApiError && err.status === 400) setState("invalid");
				else {
					setErrorMessage(getRequestErrorMessage(err, "Please try again."));
					setState("error");
				}
			});
	}, [token, isAuthenticated, reloadUser]);

	const home = isAuthenticated ? "/" : "/login";
	const homeLabel = isAuthenticated ? "Go to Trellix" : "Log in";

	return (
		<AuthLayout>
			{state === "verifying" ? (
				<div className="flex items-center gap-3 text-sm text-muted">
					<Spinner className="size-5 text-primary" />
					Verifying your email…
				</div>
			) : state === "verified" ? (
				<>
					<span className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
						<LuCircleCheck className="size-5" />
					</span>
					<h1 className="mt-5 text-2xl font-semibold tracking-tight">Email verified</h1>
					<p className="mt-2 text-sm leading-relaxed text-muted">
						Thanks! You can now use this email to reset your password if you ever need to.
					</p>
					<Link to={home} replace className={buttonPrimaryClass("mt-6 w-full py-2.5")}>
						{homeLabel}
					</Link>
				</>
			) : (
				<>
					<span className="grid size-11 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
						<LuMailX className="size-5" />
					</span>
					<h1 className="mt-5 text-2xl font-semibold tracking-tight">
						{state === "error" ? "Something went wrong" : "This link doesn’t work"}
					</h1>
					<p className="mt-2 text-sm leading-relaxed text-muted">
						{state === "error"
							? errorMessage
							: "Verification links work once and expire after 24 hours. If you’ve already verified, you’re all set. Otherwise, send yourself a new link."}
					</p>
					<ResendForm defaultEmail={user?.email ?? ""} />
					<Link to={home} replace className="mt-6 inline-block text-sm text-muted hover:text-fg">
						{homeLabel} instead
					</Link>
				</>
			)}
		</AuthLayout>
	);
}

function ResendForm({ defaultEmail }: { defaultEmail: string }) {
	const [email, setEmail] = useState(defaultEmail);
	const [sending, setSending] = useState(false);
	const [sentUntil, setSentUntil] = useState<string | null>(null);
	const cooldown = useCooldown();

	async function submit(e: FormEvent) {
		e.preventDefault();
		if (!email.trim()) {
			showAlert("Email required", "warning", "Enter the email you signed up with.");
			return;
		}
		setSending(true);
		try {
			const res = await resendVerificationEmail(email.trim());
			setSentUntil(res.expires_at);
		} catch (err) {
			cooldown.startFrom(err);
			showAlert("Could not send the link", "error", getRequestErrorMessage(err, "Please try again."));
		} finally {
			setSending(false);
		}
	}

	if (sentUntil) {
		return (
			<div className="mt-6 rounded-xl border border-line bg-surface-2/50 p-3 text-sm leading-relaxed text-muted">
				If <span className="font-medium text-fg">{email.trim()}</span> belongs to an unverified account, a new link is
				on its way. It expires on <span className="font-medium text-fg">{formatDateTime(sentUntil)}</span>.
			</div>
		);
	}

	return (
		<form onSubmit={submit} className="mt-6 space-y-3" noValidate>
			<TextField
				label="Email"
				type="email"
				icon={<LuMail />}
				placeholder="you@company.com"
				autoComplete="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Button type="submit" className="w-full py-2.5" loading={sending} disabled={cooldown.waiting}>
				{cooldown.waiting ? `Try again in ${formatWait(cooldown.secondsLeft)}` : "Send a new link"}
			</Button>
		</form>
	);
}

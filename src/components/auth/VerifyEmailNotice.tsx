import { useState } from "react";
import { LuArrowRight, LuMailCheck } from "react-icons/lu";

import Button from "@/components/ui/Button";
import { formatWait, useCooldown } from "@/hooks/useCooldown";
import { resendVerificationEmail } from "@/lib/api/auth";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { formatDateTime } from "@/lib/project/projectDisplay";
import { showAlert } from "@/services/alertService";

type VerifyEmailNoticeProps = {
	email: string;
	/** When the emailed link expires; null if the backend could not create one. */
	expiresAt: string | null;
	onContinue: () => void;
	continuing: boolean;
};

/** Shown after sign-up: the account works now, but the email should be verified before the link expires. */
export function VerifyEmailNotice({ email, expiresAt: initialExpiry, onContinue, continuing }: VerifyEmailNoticeProps) {
	const [expiresAt, setExpiresAt] = useState(initialExpiry);
	const [resending, setResending] = useState(false);
	const cooldown = useCooldown();

	async function resend() {
		setResending(true);
		try {
			const res = await resendVerificationEmail(email);
			setExpiresAt(res.expires_at);
			showAlert("Link sent", "success", `A new verification link is on its way to ${email}.`);
		} catch (err) {
			cooldown.startFrom(err);
			showAlert("Could not send the link", "error", getRequestErrorMessage(err, "Please try again in a moment."));
		} finally {
			setResending(false);
		}
	}

	return (
		<>
			<span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
				<LuMailCheck className="size-5" />
			</span>
			<h1 className="mt-5 text-2xl font-semibold tracking-tight">Verify your email</h1>
			{expiresAt ? (
				<p className="mt-2 text-sm leading-relaxed text-muted">
					We sent a verification link to <span className="font-medium text-fg">{email}</span>. Open it before{" "}
					<span className="font-medium text-fg">{formatDateTime(expiresAt)}</span>, when it expires.
				</p>
			) : (
				<p className="mt-2 text-sm leading-relaxed text-muted">
					We couldn’t send a verification email to <span className="font-medium text-fg">{email}</span> just now.
					You can request one below or later from Settings.
				</p>
			)}
			<div className="mt-5 rounded-xl border border-line bg-surface-2/50 p-3 text-xs leading-relaxed text-muted">
				Your account is ready to use. Verifying your email lets you reset your password if you ever forget it.
			</div>
			<Button className="mt-6 w-full py-2.5" onClick={onContinue} loading={continuing}>
				Continue to Trellix
				{continuing ? null : <LuArrowRight className="size-4" />}
			</Button>
			<p className="mt-4 text-center text-sm text-muted">
				{expiresAt ? "Didn’t get it? " : null}
				<button
					type="button"
					onClick={() => void resend()}
					disabled={resending || cooldown.waiting}
					className="cursor-pointer font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
				>
					{resending
						? "Sending…"
						: cooldown.waiting
							? `Try again in ${formatWait(cooldown.secondsLeft)}`
							: expiresAt
								? "Send a new link"
								: "Send verification email"}
				</button>
			</p>
		</>
	);
}

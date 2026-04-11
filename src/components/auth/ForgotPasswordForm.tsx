import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { FiExternalLink } from "react-icons/fi";

import { requestPasswordReset } from "@/lib/api/auth";
import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const year = new Date().getFullYear();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			showAlert(
				"Validation Error",
				"warning",
				"Please enter your email address",
			);
			return;
		}

		setLoading(true);
		try {
			const res = await requestPasswordReset(email.trim());
			showAlert(
				"Check your email",
				"success",
				res.message ||
					"If an account exists for this address, we sent reset instructions.",
			);
			setEmail("");
		} catch (error: unknown) {
			showAlert(
				"Request failed",
				"error",
				getRequestErrorMessage(
					error,
					"Could not send reset instructions. Please try again.",
				),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 w-full flex-col items-center justify-between bg-background-secondary p-4 lg:justify-center">
			<div className="flex w-full items-center justify-start gap-2 p-2 lg:hidden">
				<img
					src="/layers.svg"
					alt=""
					className="size-8"
					width={32}
					height={32}
				/>
				<h1 className="text-2xl font-bold text-text-primary">
					Trellix
				</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className="flex min-h-0 w-full flex-1 flex-col items-center justify-evenly p-2 lg:min-h-0 lg:flex-none lg:p-4"
			>
				<div className="mb-2 flex w-full flex-col items-start gap-1 justify-center p-2 lg:p-4">
					<h2 className="text-xl font-bold text-text-primary">
						Forgot password
					</h2>
					<p className="text-xs text-text-secondary">
						Enter the email for your account. We&apos;ll send reset
						instructions if it exists.
					</p>
				</div>

				<div className="mt-4 flex w-full flex-col items-start justify-center gap-4 p-2 lg:p-4">
					<FormField
						title="Email"
						placeholder="Enter your email..."
						type="email"
						value={email}
						handleChange={(ev: ChangeEvent<HTMLInputElement>) =>
							setEmail(ev.target.value)
						}
					/>
				</div>

				<div className="flex w-full flex-col items-center justify-center gap-4 p-2 lg:p-4">
					<Button
						title="Send reset link"
						fill={true}
						type="submit"
						loading={loading}
						loader={
							<CustomLoader
								size={24}
								color="#ffffff"
								containerStyle={{ width: 24, height: 24 }}
								aria-label="Sending"
							/>
						}
					/>
				</div>

				<div className="flex w-full items-center justify-center p-2 lg:p-4">
					<p className="text-xs text-text-secondary">
						Remember your password?{" "}
						<Link
							to="/login"
							className="text-primary hover:underline"
						>
							Back to login
						</Link>
					</p>
				</div>
			</form>

			<div className="flex w-full flex-col items-center justify-center gap-2 self-end p-2 lg:hidden">
				<p className="text-xs text-text-secondary">
					&copy; Trellix {year}
				</p>
				<Link
					to="/legal#terms-of-use"
					className="flex flex-row items-center gap-1 text-xs text-text-secondary underline-offset-2 underline"
				>
					Terms of use &amp; Privacy Policy
					<FiExternalLink className="inline-block" />
				</Link>
			</div>
		</div>
	);
}

import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FiExternalLink } from "react-icons/fi";

import { useAuth } from "@/contexts/auth";
import googleLogo from "@/assets/google.svg";
import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { safeAppRedirectTarget } from "@/lib/auth/auth-routes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;

export function SignupForm() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const [searchParams] = useSearchParams();
	const redirectTo = safeAppRedirectTarget(searchParams.get("redirectTo"));
	const navigate = useNavigate();
	const { register, login } = useAuth();

	const year = new Date().getFullYear();

	const handleSignUp = async (e: FormEvent) => {
		e.preventDefault();

		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!email.trim() ||
			!password ||
			!confirmPassword
		) {
			showAlert(
				"Validation Error",
				"warning",
				"Please fill in all fields",
			);
			return;
		}

		if (password !== confirmPassword) {
			showAlert("Validation Error", "warning", "Passwords do not match");
			return;
		}

		if (password.length < PASSWORD_MIN) {
			showAlert(
				"Validation Error",
				"warning",
				`Password must be at least ${PASSWORD_MIN} characters long`,
			);
			return;
		}

		if (password.length > PASSWORD_MAX) {
			showAlert(
				"Validation Error",
				"warning",
				`Password must be at most ${PASSWORD_MAX} characters long`,
			);
			return;
		}

		if (!/[A-Z]/.test(password)) {
			showAlert(
				"Validation Error",
				"warning",
				"Password must contain at least one uppercase letter",
			);
			return;
		}

		if (!/[0-9]/.test(password)) {
			showAlert(
				"Validation Error",
				"warning",
				"Password must contain at least one number",
			);
			return;
		}

		setLoading(true);
		try {
			await register({
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim(),
				password,
			});
			await login({ email: email.trim(), password });
			showAlert("Success", "success", "Account created successfully!");
			navigate(redirectTo, { replace: true });
		} catch (error: unknown) {
			showAlert(
				"Signup Failed",
				"error",
				getRequestErrorMessage(
					error,
					"An error occurred during signup. Please try again.",
				),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignUp = (e: MouseEvent) => {
		e.preventDefault();
		showAlert(
			"Coming Soon!",
			"info",
			"Google signup will be available soon!",
		);
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
				onSubmit={handleSignUp}
				className="flex min-h-0 w-full flex-1 flex-col items-center justify-evenly p-2 lg:min-h-0 lg:flex-none lg:p-4"
			>
				<div className="mb-2 flex w-full flex-col items-star gap-1 justify-center p-2 lg:p-4">
					<h2 className="text-xl font-bold text-text-primary">
						Sign Up
					</h2>
					<p className="text-xs text-text-secondary">
						Welcome! Please create your account to get started.
					</p>
				</div>

				<div className="mt-2 flex w-full flex-col items-start justify-center gap-4 p-2 lg:p-4">
					<div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
						<div className="min-w-0 flex-1">
							<FormField
								title="First Name"
								placeholder="Enter your first name..."
								type="text"
								value={firstName}
								handleChange={(
									ev: ChangeEvent<HTMLInputElement>,
								) => setFirstName(ev.target.value)}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<FormField
								title="Last Name"
								placeholder="Enter your last name..."
								type="text"
								value={lastName}
								handleChange={(
									ev: ChangeEvent<HTMLInputElement>,
								) => setLastName(ev.target.value)}
							/>
						</div>
					</div>

					<FormField
						title="Email"
						placeholder="Enter your email..."
						type="email"
						value={email}
						handleChange={(ev: ChangeEvent<HTMLInputElement>) =>
							setEmail(ev.target.value)
						}
					/>

					<FormField
						title="Password"
						placeholder="Enter your password..."
						type="password"
						value={password}
						handleChange={(ev: ChangeEvent<HTMLInputElement>) =>
							setPassword(ev.target.value)
						}
					/>

					<FormField
						title="Confirm Password"
						placeholder="Confirm your password..."
						type="password"
						value={confirmPassword}
						handleChange={(ev: ChangeEvent<HTMLInputElement>) =>
							setConfirmPassword(ev.target.value)
						}
					/>
				</div>

				<div className="flex w-full flex-col items-center justify-center gap-4 p-2 lg:p-4">
					<Button
						title="Sign Up"
						fill={true}
						type="submit"
						loading={loading}
						loader={
							<CustomLoader
								size={24}
								color="#ffffff"
								containerStyle={{ width: 24, height: 24 }}
								aria-label="Creating account"
							/>
						}
					/>
					<Button
						title="Sign Up with"
						imgSrc={googleLogo}
						fill={false}
						type="button"
						onClick={handleGoogleSignUp}
						disabled={loading}
					/>
				</div>

				<div className="flex w-full items-center justify-center p-2 lg:p-4">
					<p className="text-xs text-text-secondary">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-primary hover:underline"
						>
							Login
						</Link>
					</p>
				</div>
			</form>

			<div className="flex w-full flex-col items-center justify-center gap-2 self-end p-2 lg:hidden">
				<p className="text-xs text-text-secondary">
					&copy; Trellix&trade; {year}
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

import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FiExternalLink } from "react-icons/fi";

import { useAuth } from "@/contexts/auth";
import googleLogo from "@/assets/google.svg";
import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/";
	const navigate = useNavigate();
	const { login } = useAuth();

	const year = new Date().getFullYear();

	const handleLogin = async (e: FormEvent) => {
		e.preventDefault();

		if (!email.trim() || !password) {
			showAlert(
				"Validation Error",
				"warning",
				"Please fill in all fields",
			);
			return;
		}

		setLoading(true);
		try {
			await login({ email: email.trim(), password });
			navigate(redirectTo, { replace: true });
		} catch (error: unknown) {
			showAlert(
				"Login Failed",
				"error",
				getRequestErrorMessage(
					error,
					"Invalid credentials. Please try again.",
				),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = (e: MouseEvent) => {
		e.preventDefault();
		showAlert(
			"Coming Soon!",
			"info",
			"Google login will be available soon!",
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
				onSubmit={handleLogin}
				className="flex min-h-0 w-full flex-1 flex-col items-center justify-evenly p-2 lg:min-h-0 lg:flex-none lg:p-4"
			>
				<div className="mb-2 flex w-full flex-col items-start gap-1 justify-center p-2 lg:p-4">
					<h2 className="text-xl font-bold text-text-primary">
						Login
					</h2>
					<p className="text-xs text-text-secondary">
						Welcome back! Please login to your account.
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
					<FormField
						title="Password"
						placeholder="Enter your password..."
						type="password"
						value={password}
						handleChange={(ev: ChangeEvent<HTMLInputElement>) =>
							setPassword(ev.target.value)
						}
					/>
				</div>

				<div className="flex w-full items-center justify-end p-2 lg:p-4">
					<Link
						to="/forgot-password"
						className="text-xs text-primary underline-offset-2 hover:underline"
					>
						Forgot password?
					</Link>
				</div>

				<div className="flex w-full flex-col items-center justify-center gap-4 p-2 lg:p-4">
					<Button
						title="Login"
						fill={true}
						type="submit"
						loading={loading}
						loader={
							<CustomLoader
								size={24}
								color="#ffffff"
								containerStyle={{ width: 24, height: 24 }}
								aria-label="Signing in"
							/>
						}
					/>
					<Button
						title="Login with "
						imgSrc={googleLogo}
						fill={false}
						type="button"
						onClick={handleGoogleLogin}
						disabled={loading}
					/>
				</div>

				<div className="flex w-full items-center justify-center p-2 lg:p-4">
					<p className="text-xs text-text-secondary">
						Don&apos;t have an account?{" "}
						<Link
							to="/signup"
							className="text-primary hover:underline"
						>
							Sign up
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

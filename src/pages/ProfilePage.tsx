import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { useAuth } from "@/contexts/auth";
import { updateUserPassword, updateUserProfile } from "@/lib/api/user";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

const NAME_MAX = 32;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;

function initials(firstName: string, lastName: string): string {
	const first = firstName.trim().charAt(0);
	const last = lastName.trim().charAt(0);
	return `${first}${last}`.toUpperCase() || "?";
}

export function ProfilePage() {
	const { user, reloadUser } = useAuth();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [loading, setLoading] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);

	useEffect(() => {
		if (!user) return;
		setFirstName(user.first_name);
		setLastName(user.last_name);
	}, [user]);

	const isUnchanged = useMemo(() => {
		if (!user) return true;
		return (
			firstName.trim() === user.first_name.trim() &&
			lastName.trim() === user.last_name.trim()
		);
	}, [firstName, lastName, user]);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!user) return;

		const nextFirstName = firstName.trim();
		const nextLastName = lastName.trim();

		if (!nextFirstName || !nextLastName) {
			showAlert(
				"Validation Error",
				"warning",
				"First name and last name are required.",
			);
			return;
		}

		if (nextFirstName.length > NAME_MAX || nextLastName.length > NAME_MAX) {
			showAlert(
				"Validation Error",
				"warning",
				`First name and last name must be at most ${NAME_MAX} characters.`,
			);
			return;
		}

		if (isUnchanged) {
			showAlert("No changes", "info", "Your profile is already up to date.");
			return;
		}

		setLoading(true);
		try {
			await updateUserProfile({
				first_name: nextFirstName,
				last_name: nextLastName,
			});
			await reloadUser();
			showAlert("Profile updated", "success", "Your changes were saved.");
		} catch (error: unknown) {
			showAlert(
				"Update failed",
				"error",
				getRequestErrorMessage(
					error,
					"Could not update your profile. Please try again.",
				),
			);
		} finally {
			setLoading(false);
		}
	}

	async function handlePasswordSubmit(e: FormEvent) {
		e.preventDefault();
		if (!user) return;

		if (!currentPassword || !newPassword || !confirmPassword) {
			showAlert(
				"Validation Error",
				"warning",
				"Please fill in all password fields.",
			);
			return;
		}

		if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX) {
			showAlert(
				"Validation Error",
				"warning",
				`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`,
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			showAlert(
				"Validation Error",
				"warning",
				"New password and confirmation do not match.",
			);
			return;
		}

		setPasswordLoading(true);
		try {
			await updateUserPassword({
				current_password: currentPassword,
				new_password: newPassword,
			});
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			showAlert("Password updated", "success", "Your password was changed.");
		} catch (error: unknown) {
			showAlert(
				"Update failed",
				"error",
				getRequestErrorMessage(
					error,
					"Could not update your password. Please try again.",
				),
			);
		} finally {
			setPasswordLoading(false);
		}
	}

	if (!user) {
		return (
			<div className="mx-auto flex w-full max-w-3xl justify-center py-10">
				<CustomLoader size={42} aria-label="Loading profile" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-3xl">
			<section className="rounded-xl border border-primary/10 bg-background-secondary p-5 shadow-sm sm:p-6">
				<p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
					Your profile
				</p>
				<h1 className="mt-2 text-2xl font-bold text-text-primary">
					Account details
				</h1>
				<p className="mt-2 text-sm text-text-secondary">
					Update the name shown across your workspace.
				</p>
			</section>

			<section className="mt-6 rounded-xl border border-primary/10 bg-background-secondary p-5 shadow-sm sm:p-6">
				<div className="flex items-center gap-3 border-b border-primary/10 pb-5">
					<div
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
						aria-hidden
					>
						{initials(firstName, lastName)}
					</div>
					<div className="min-w-0">
						<p className="truncate text-base font-semibold text-text-primary">
							{`${firstName.trim()} ${lastName.trim()}`.trim()}
						</p>
						<p className="truncate text-sm text-text-secondary">{user.email}</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="mt-5 space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							title="First Name"
							placeholder="Enter your first name..."
							type="text"
							value={firstName}
							autoComplete="given-name"
							handleChange={(e: ChangeEvent<HTMLInputElement>) =>
								setFirstName(e.target.value)
							}
						/>
						<FormField
							title="Last Name"
							placeholder="Enter your last name..."
							type="text"
							value={lastName}
							autoComplete="family-name"
							handleChange={(e: ChangeEvent<HTMLInputElement>) =>
								setLastName(e.target.value)
							}
						/>
					</div>

					<div className="rounded-lg border border-primary/10 bg-tint p-3">
						<p className="text-xs text-text-secondary">Email</p>
						<p className="mt-1 text-sm font-medium text-text-primary">
							{user.email}
						</p>
					</div>

					<div className="flex justify-end pt-1">
						<div className="w-full sm:w-44">
							<Button
								type="submit"
								title="Save changes"
								loading={loading}
								disabled={loading || isUnchanged}
								loader={
									<CustomLoader
										size={16}
										color="#ffffff"
										containerStyle={{ width: 16, height: 16 }}
										aria-label="Saving profile changes"
									/>
								}
							/>
						</div>
					</div>
				</form>
			</section>

			<section className="mt-6 rounded-xl border border-primary/10 bg-background-secondary p-5 shadow-sm sm:p-6">
				<h2 className="text-lg font-semibold text-text-primary">Password</h2>
				<p className="mt-1 text-sm text-text-secondary">
					Update your account password.
				</p>

				<form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
					<FormField
						title="Current password"
						placeholder="Enter current password"
						type="password"
						value={currentPassword}
						autoComplete="current-password"
						handleChange={(e: ChangeEvent<HTMLInputElement>) =>
							setCurrentPassword(e.target.value)
						}
					/>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							title="New password"
							placeholder="Enter new password"
							type="password"
							value={newPassword}
							autoComplete="new-password"
							handleChange={(e: ChangeEvent<HTMLInputElement>) =>
								setNewPassword(e.target.value)
							}
						/>
						<FormField
							title="Confirm new password"
							placeholder="Confirm new password"
							type="password"
							value={confirmPassword}
							autoComplete="new-password"
							handleChange={(e: ChangeEvent<HTMLInputElement>) =>
								setConfirmPassword(e.target.value)
							}
						/>
					</div>
					<div className="flex justify-end pt-1">
						<div className="w-full sm:w-44">
							<Button
								type="submit"
								title="Update password"
								loading={passwordLoading}
								disabled={passwordLoading}
								loader={
									<CustomLoader
										size={16}
										color="#ffffff"
										containerStyle={{ width: 16, height: 16 }}
										aria-label="Updating password"
									/>
								}
							/>
						</div>
					</div>
				</form>
			</section>
		</div>
	);
}

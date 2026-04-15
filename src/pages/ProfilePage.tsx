import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import FormField from "@/components/ui/FormField";
import { useAuth } from "@/contexts/auth";
import { updateUserProfile } from "@/lib/api/user";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { showAlert } from "@/services/alertService";

const NAME_MAX = 32;

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
										size={24}
										color="#ffffff"
										containerStyle={{ width: 24, height: 24 }}
										aria-label="Saving profile changes"
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

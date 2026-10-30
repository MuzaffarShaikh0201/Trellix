import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { NavLink, Navigate, useNavigate, useParams } from "react-router";
import {
	LuBadgeCheck,
	LuCircleAlert,
	LuLogOut,
	LuMail,
	LuMonitor,
	LuMoon,
	LuPalette,
	LuShield,
	LuSun,
	LuUser,
} from "react-icons/lu";

import { Page } from "@/components/layout/AppShell";
import { UserAvatar } from "@/components/layout/UserMenu";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { TextField } from "@/components/ui/Field";
import { useAuth } from "@/contexts/auth";
import { formatWait, useCooldown } from "@/hooks/useCooldown";
import type { Theme } from "@/contexts/theme/theme-context";
import { useTheme } from "@/contexts/theme/useTheme";
import { resendVerificationEmail } from "@/lib/api/auth";
import { updateUserPassword, updateUserProfile } from "@/lib/api/user";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { PASSWORD_MAX, PASSWORD_RULES_TEXT, firstFailedRule } from "@/lib/auth/passwordRules";
import { formatDateTime, formatDay } from "@/lib/project/projectDisplay";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";

const NAME_MAX = 32;

const SECTIONS = [
	{ key: "profile", label: "Profile", Icon: LuUser },
	{ key: "security", label: "Security", Icon: LuShield },
	{ key: "appearance", label: "Appearance", Icon: LuPalette },
] as const;
type Section = (typeof SECTIONS)[number]["key"];

export function SettingsPage() {
	const { section } = useParams<{ section: string }>();
	if (!SECTIONS.some((s) => s.key === section)) return <Navigate to="/settings/profile" replace />;
	const current = section as Section;

	return (
		<Page width="max-w-5xl">
			<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
			<div className="mt-5 grid gap-6 md:grid-cols-[12rem_1fr]">
				<nav aria-label="Settings sections" className="custom-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
					{SECTIONS.map(({ key, label, Icon }) => (
						<NavLink
							key={key}
							to={`/settings/${key}`}
							replace
							className={({ isActive }) =>
								cn(
									"flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
									isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-fg",
								)
							}
						>
							<Icon className="size-4" />
							{label}
						</NavLink>
					))}
				</nav>
				<div className="min-w-0">
					{current === "profile" ? <ProfileSection /> : null}
					{current === "security" ? <SecuritySection /> : null}
					{current === "appearance" ? <AppearanceSection /> : null}
				</div>
			</div>
		</Page>
	);
}

function Row({ label, description, children }: { label: string; description: string; children: ReactNode }) {
	return (
		<div className="grid gap-3 border-b border-line py-5 last:border-b-0 md:grid-cols-[14rem_1fr] md:gap-8">
			<div>
				<p className="text-sm font-medium">{label}</p>
				<p className="mt-0.5 text-xs text-muted">{description}</p>
			</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}

function ProfileSection() {
	const { user, reloadUser } = useAuth();
	const [first, setFirst] = useState("");
	const [last, setLast] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!user) return;
		setFirst(user.first_name);
		setLast(user.last_name);
	}, [user]);

	if (!user) return null;
	const unchanged = first.trim() === user.first_name.trim() && last.trim() === user.last_name.trim();

	async function submit(e: FormEvent) {
		e.preventDefault();
		const f = first.trim();
		const l = last.trim();
		if (!f || !l) {
			showAlert("Name required", "warning", "First and last name can’t be empty.");
			return;
		}
		if (f.length > NAME_MAX || l.length > NAME_MAX) {
			showAlert("Name too long", "warning", `Names can be at most ${NAME_MAX} characters.`);
			return;
		}
		setSaving(true);
		try {
			await updateUserProfile({ first_name: f, last_name: l });
			await reloadUser();
			showAlert("Profile updated", "success", "Your changes were saved.");
		} catch (err) {
			showAlert("Update failed", "error", getRequestErrorMessage(err, "Could not update your profile. Please try again."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<form onSubmit={submit}>
			<Card className="px-5">
				<Row label="Avatar" description="Generated from your initials.">
					<div className="flex items-center gap-3">
						<UserAvatar className="size-14 text-lg" />
						<span className="text-xs text-muted">Member since {formatDay(user.created_at, true)}</span>
					</div>
				</Row>
				<Row label="Name" description="Shown across the app.">
					<div className="grid max-w-md grid-cols-2 gap-3">
						<TextField
							aria-label="First name"
							value={first}
							maxLength={NAME_MAX}
							autoComplete="given-name"
							onChange={(e) => setFirst(e.target.value)}
						/>
						<TextField
							aria-label="Last name"
							value={last}
							maxLength={NAME_MAX}
							autoComplete="family-name"
							onChange={(e) => setLast(e.target.value)}
						/>
					</div>
				</Row>
				<Row label="Email" description="Used to log in. It can’t be changed here.">
					<div className="max-w-md">
						<div className="flex items-center gap-2">
							<TextField aria-label="Email" value={user.email} disabled className="flex-1" />
							<EmailVerifiedBadge verified={Boolean(user.is_email_verified)} verifiedAt={user.email_verified_at} />
						</div>
						{user.is_email_verified ? null : <VerifyEmailPrompt email={user.email} />}
					</div>
				</Row>
			</Card>
			<div className="mt-4 flex justify-end gap-2">
				<Button
					variant="secondary"
					disabled={unchanged || saving}
					onClick={() => {
						setFirst(user.first_name);
						setLast(user.last_name);
					}}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={unchanged} loading={saving}>
					Save changes
				</Button>
			</div>
		</form>
	);
}

function EmailVerifiedBadge({ verified, verifiedAt }: { verified: boolean; verifiedAt?: string | null }) {
	return verified ? (
		<span
			title={verifiedAt ? `Verified ${formatDay(verifiedAt, true)}` : "Verified"}
			className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
		>
			<LuBadgeCheck className="size-3.5" />
			Verified
		</span>
	) : (
		<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
			<LuCircleAlert className="size-3.5" />
			Not verified
		</span>
	);
}

/** Explains why verifying matters and lets the user resend the link. */
function VerifyEmailPrompt({ email }: { email: string }) {
	const [sending, setSending] = useState(false);
	const [sentUntil, setSentUntil] = useState<string | null>(null);
	const cooldown = useCooldown();
	const waitLabel = `Try again in ${formatWait(cooldown.secondsLeft)}`;

	async function resend() {
		setSending(true);
		try {
			const res = await resendVerificationEmail(email);
			setSentUntil(res.expires_at);
		} catch (err) {
			cooldown.startFrom(err);
			showAlert("Could not send the link", "error", getRequestErrorMessage(err, "Please try again in a moment."));
		} finally {
			setSending(false);
		}
	}

	return (
		<div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed">
			{sentUntil ? (
				<p className="text-muted">
					Verification link sent to <span className="font-medium text-fg">{email}</span>. Open it before{" "}
					<span className="font-medium text-fg">{formatDateTime(sentUntil)}</span>, when it expires.{" "}
					<button
						type="button"
						onClick={() => void resend()}
						disabled={sending || cooldown.waiting}
						className="cursor-pointer font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
					>
						{sending ? "Sending…" : cooldown.waiting ? waitLabel : "Send again"}
					</button>
				</p>
			) : (
				<>
					<p className="text-muted">
						Verify your email so you can reset your password if you forget it. Check your inbox for the link we
						sent when you signed up.
					</p>
					<Button
						variant="secondary"
						className="mt-2.5 py-1.5 text-xs"
						icon={<LuMail className="size-3.5" />}
						loading={sending}
						disabled={cooldown.waiting}
						onClick={() => void resend()}
					>
						{cooldown.waiting ? waitLabel : "Resend verification link"}
					</Button>
				</>
			)}
		</div>
	);
}

function SecuritySection() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [saving, setSaving] = useState(false);
	const isOAuth = user?.auth_type === "oauth";
	const mismatch = Boolean(confirm && next !== confirm);

	async function submit(e: FormEvent) {
		e.preventDefault();
		if (!current || !next || !confirm) {
			showAlert("Missing fields", "warning", "Fill in all three password fields.");
			return;
		}
		if (firstFailedRule(next)) {
			showAlert("Check the password", "warning", PASSWORD_RULES_TEXT);
			return;
		}
		if (next !== confirm) {
			showAlert("Passwords don’t match", "warning", "The new password and confirmation are different.");
			return;
		}
		setSaving(true);
		try {
			await updateUserPassword({ current_password: current, new_password: next });
			setCurrent("");
			setNext("");
			setConfirm("");
			showAlert("Password updated", "success", "Your password was changed.");
		} catch (err) {
			showAlert("Update failed", "error", getRequestErrorMessage(err, "Could not update your password. Please try again."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<Card className="px-5">
			<Row
				label="Change password"
				description={isOAuth ? "You sign in with Google, so there’s no password to change." : PASSWORD_RULES_TEXT}
			>
				{isOAuth ? null : (
					<form onSubmit={submit} className="max-w-md space-y-3">
						<TextField
							label="Current password"
							type="password"
							autoComplete="current-password"
							value={current}
							onChange={(e) => setCurrent(e.target.value)}
						/>
						<TextField
							label="New password"
							type="password"
							autoComplete="new-password"
							maxLength={PASSWORD_MAX}
							value={next}
							onChange={(e) => setNext(e.target.value)}
						/>
						<TextField
							label="Confirm new password"
							type="password"
							autoComplete="new-password"
							maxLength={PASSWORD_MAX}
							value={confirm}
							onChange={(e) => setConfirm(e.target.value)}
							hint={mismatch ? <span className="text-red-600 dark:text-red-400">Passwords don’t match.</span> : undefined}
						/>
						<Button type="submit" loading={saving}>
							Update password
						</Button>
					</form>
				)}
			</Row>
			<Row label="Session" description="You’re logged in on this device.">
				<Button
					variant="secondary"
					className="text-red-600 dark:text-red-400"
					icon={<LuLogOut className="size-4" />}
					onClick={async () => {
						await logout();
						navigate("/login");
					}}
				>
					Log out
				</Button>
			</Row>
		</Card>
	);
}

const THEMES: { value: Theme; label: string; Icon: typeof LuSun; preview: string }[] = [
	{ value: "light", label: "Light", Icon: LuSun, preview: "bg-slate-100" },
	{ value: "dark", label: "Dark", Icon: LuMoon, preview: "bg-[#0d1424]" },
	{ value: "system", label: "System", Icon: LuMonitor, preview: "bg-gradient-to-r from-slate-100 to-[#0d1424]" },
];

function AppearanceSection() {
	const { theme, setTheme, density, setDensity } = useTheme();
	return (
		<Card className="px-5">
			<Row label="Theme" description="Choose how Trellix looks. System follows your device setting.">
				<div className="grid max-w-lg grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
					{THEMES.map(({ value, label, Icon, preview }) => (
						<button
							key={value}
							type="button"
							role="radio"
							aria-checked={theme === value}
							onClick={() => setTheme(value)}
							className={cn(
								"cursor-pointer rounded-xl border-2 p-2 text-left transition",
								theme === value ? "border-primary" : "border-line hover:border-primary/40",
							)}
						>
							<div className={cn("h-16 rounded-lg p-2", preview)}>
								<div className="h-2 w-8 rounded bg-primary" />
								<div className={cn("mt-1.5 h-1.5 w-12 rounded", value === "light" ? "bg-slate-300" : "bg-slate-500")} />
							</div>
							<p className="mt-2 flex items-center gap-1.5 text-xs font-medium">
								<Icon className="size-3.5" />
								{label}
							</p>
						</button>
					))}
				</div>
			</Row>
			<Row label="Density" description="Compact fits more on screen by tightening text and spacing.">
				<Segmented
					className="w-64"
					ariaLabel="Density"
					value={density}
					onChange={setDensity}
					options={[
						{ value: "comfortable", label: "Comfortable" },
						{ value: "compact", label: "Compact" },
					]}
				/>
			</Row>
		</Card>
	);
}

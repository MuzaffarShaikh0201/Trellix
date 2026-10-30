import { useCallback, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
	LuArchive,
	LuArchiveRestore,
	LuCalendar,
	LuChevronDown,
	LuCircleDot,
	LuClock,
	LuEllipsis,
	LuExternalLink,
	LuFileText,
	LuFlag,
	LuGithub,
	LuHistory,
	LuPalette,
	LuPencil,
	LuPin,
	LuPlus,
	LuStar,
	LuTrash2,
} from "react-icons/lu";

import { Page } from "@/components/layout/AppShell";
import { TopbarActions } from "@/components/layout/TopbarActions";
import { DeleteProjectModal } from "@/components/project/DeleteProjectModal";
import { ProjectActivity } from "@/components/project/ProjectActivity";
import { ProjectNotesPanel } from "@/components/project/ProjectNotesPanel";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { DueLabel } from "@/components/project/ProjectTimeline";
import { ProjectTile } from "@/components/project/ProjectTile";
import Button from "@/components/ui/Button";
import {
	buttonGhostClass,
	buttonSecondaryClass,
	iconButtonClass,
	menuItemClass,
	popoverPanelClass,
} from "@/components/ui/buttonStyles";
import {
	Card,
	CardHeader,
	ErrorState,
	Skeleton,
} from "@/components/ui/Card";
import { inputClass } from "@/components/ui/fieldStyles";
import { TaskBoard } from "@/components/task/TaskBoard";
import { TASK_PRIORITIES, TASK_PRIORITY_META } from "@/lib/task/taskDisplay";
import { useDismiss } from "@/hooks/useDismiss";
import { fetchNotes } from "@/lib/api/notes";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { normalizeRepoUrl } from "@/lib/project/normalizeRepoUrl";
import { toDateInputValue } from "@/lib/project/projectPrimaryDetailsForm";
import {
	PROJECT_COLOR_SWATCHES,
	formatDay,
	projectColor,
	repoDisplayName,
	timeAgo,
	timelinePercent,
} from "@/lib/project/projectDisplay";
import { PROJECT_STATUS_OPTIONS } from "@/lib/project/projectStatusStyles";
import {
	noteKeys,
	useDeleteProject,
	useProject,
	useToggleArchive,
	useToggleFavorite,
	useUpdateProject,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";
import type {
	Project,
	ProjectStatus,
	UpdateProjectParams,
} from "@/types/project";

type Tab = "overview" | "notes" | "tasks" | "timeline";
const TABS: Tab[] = ["overview", "notes", "tasks", "timeline"];

export function ProjectPage() {
	const { projectId } = useParams<{ projectId: string }>();
	const [sp, setSp] = useSearchParams();
	const tab = (TABS as string[]).includes(sp.get("tab") ?? "")
		? (sp.get("tab") as Tab)
		: "overview";
	const {
		data: project,
		isPending,
		isError,
		error,
		refetch,
		isRefetching,
	} = useProject(projectId);

	const notesCount = useQuery({
		queryKey: [...noteKeys.all, "project", projectId, "count"],
		queryFn: () => fetchNotes({ project_id: projectId, limit: 1 }),
		enabled: Boolean(projectId),
	});

	if (isError) {
		return (
			<Page>
				<ErrorState
					title="Could not load this project"
					message={getRequestErrorMessage(
						error,
						"It may have been deleted, or the server is unavailable.",
					)}
					onRetry={() => void refetch()}
					retrying={isRefetching}
				/>
				<Link to="/projects" className={buttonGhostClass("mt-3")}>
					Back to projects
				</Link>
			</Page>
		);
	}
	if (isPending || !project) return <ProjectSkeleton />;

	const tabs: { value: Tab; label: ReactNode }[] = [
		{ value: "overview", label: "Overview" },
		{
			value: "notes",
			label: (
				<>
					Notes
					{notesCount.data ? (
						<span className="ml-1.5 rounded-full bg-surface-2 px-1.5 text-[10px] tabular-nums">
							{notesCount.data.total_items}
						</span>
					) : null}
				</>
			),
		},
		{
			value: "tasks",
			label: (
				<>
					Tasks
					{project.task_counts?.total ? (
						<span className="ml-1.5 rounded-full bg-surface-2 px-1.5 text-[10px] tabular-nums">
							{project.task_counts.completed}/{project.task_counts.total}
						</span>
					) : null}
				</>
			),
		},
		{ value: "timeline", label: "Timeline" },
	];

	return (
		<Page>
			<ProjectHeader project={project} />

			<div
				role="tablist"
				className="custom-scrollbar -mx-4 mt-5 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0"
			>
				{tabs.map((t) => (
					<button
						key={t.value}
						type="button"
						role="tab"
						aria-selected={tab === t.value}
						onClick={() =>
							setSp(
								t.value === "overview" ? {} : { tab: t.value },
								{ replace: true },
							)
						}
						className={cn(
							"-mb-px inline-flex shrink-0 cursor-pointer items-center border-b-2 px-3 py-2.5 text-sm font-medium transition",
							tab === t.value
								? "border-primary text-fg"
								: "border-transparent text-muted hover:text-fg",
						)}
					>
						{t.label}
					</button>
				))}
			</div>

			<div className="mt-5">
				{tab === "overview" ? <Overview project={project} /> : null}
				{tab === "notes" ? (
					<ProjectNotesPanel project={project} />
				) : null}
				{tab === "tasks" ? <TaskBoard projectId={project.id} /> : null}
				{tab === "timeline" ? <ProjectActivity projectId={project.id} /> : null}
			</div>
		</Page>
	);
}

function ProjectHeader({ project }: { project: Project }) {
	const navigate = useNavigate();
	const favorite = useToggleFavorite();
	const archive = useToggleArchive();
	const del = useDeleteProject();
	const update = useUpdateProject(project.id);
	const [menuOpen, setMenuOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const closeMenu = useCallback(() => setMenuOpen(false), []);
	useDismiss(menuRef, menuOpen, closeMenu);
	const repoHref = project.repo_url
		? normalizeRepoUrl(project.repo_url)
		: null;

	const star = (
		<button
			type="button"
			onClick={() => favorite.mutate(project.id)}
			disabled={favorite.isPending}
			aria-pressed={project.is_favorite}
			aria-label={
				project.is_favorite
					? "Remove from favorites"
					: "Add to favorites"
			}
			className={iconButtonClass("hover:text-amber-500")}
		>
			<LuStar
				className={cn(
					"size-4",
					project.is_favorite && "fill-amber-400 text-amber-400",
				)}
			/>
		</button>
	);

	return (
		<>
			<TopbarActions>{star}</TopbarActions>
			<div className="flex flex-wrap items-start gap-4">
				<ProjectTile
					project={project}
					className="size-12 rounded-xl text-sm"
				/>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<InlineTitle
							value={project.title}
							onSave={(title) => update.mutate({ title })}
						/>
						<ProjectStatusChip status={project.status} />
						{project.is_archived ? (
							<span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[11px] font-medium text-muted">
								Archived
							</span>
						) : null}
					</div>
					<p className="mt-1 text-xs text-muted">
						Created {formatDay(project.created_at, true)} · Updated{" "}
						{timeAgo(project.updated_at)}
					</p>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="md:hidden">{star}</span>
					{repoHref ? (
						<a
							href={repoHref}
							target="_blank"
							rel="noopener noreferrer"
							className={buttonSecondaryClass("py-1.5")}
						>
							<LuGithub className="size-4" />
							<span className="max-sm:hidden">Repository</span>
						</a>
					) : null}
					<div ref={menuRef} className="relative">
						<button
							type="button"
							onClick={() => setMenuOpen((v) => !v)}
							aria-haspopup="menu"
							aria-expanded={menuOpen}
							aria-label="More actions"
							className={buttonSecondaryClass("px-2 py-1.5")}
						>
							<LuEllipsis className="size-4" />
						</button>
						{menuOpen ? (
							<div
								role="menu"
								className={cn(
									popoverPanelClass,
									"absolute top-full right-0 z-40 mt-1.5 w-52",
								)}
							>
								<button
									type="button"
									role="menuitem"
									className={menuItemClass}
									onClick={() => {
										closeMenu();
										favorite.mutate(project.id);
									}}
								>
									<LuStar className="size-4 text-muted" />
									{project.is_favorite
										? "Remove from favorites"
										: "Add to favorites"}
								</button>
								<button
									type="button"
									role="menuitem"
									className={menuItemClass}
									disabled={archive.isPending}
									onClick={() => {
										closeMenu();
										archive.mutate(project);
									}}
								>
									{project.is_archived ? (
										<LuArchiveRestore className="size-4 text-muted" />
									) : (
										<LuArchive className="size-4 text-muted" />
									)}
									{project.is_archived
										? "Restore from archive"
										: "Archive"}
								</button>
								<div className="my-1 border-t border-line" />
								<button
									type="button"
									role="menuitem"
									className={cn(
										menuItemClass,
										"text-red-600 hover:bg-red-500/10 dark:text-red-400",
									)}
									onClick={() => {
										closeMenu();
										setDeleteOpen(true);
									}}
								>
									<LuTrash2 className="size-4" />
									Delete project
								</button>
							</div>
						) : null}
					</div>
				</div>
			</div>
			<DeleteProjectModal
				open={deleteOpen}
				project={project}
				deleting={del.isPending}
				onClose={() => setDeleteOpen(false)}
				onArchive={
					project.is_archived
						? undefined
						: () => {
								setDeleteOpen(false);
								archive.mutate(project);
							}
				}
				onConfirm={() =>
					del.mutate(project.id, {
						onSuccess: () => {
							setDeleteOpen(false);
							navigate("/projects", { replace: true });
						},
					})
				}
			/>
		</>
	);
}

function InlineTitle({
	value,
	onSave,
}: {
	value: string;
	onSave: (v: string) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	function startEdit() {
		setDraft(value);
		setEditing(true);
	}

	function commit() {
		const next = draft.trim();
		setEditing(false);
		if (!next) {
			setDraft(value);
			showAlert("Title required", "warning", "A project needs a title.");
			return;
		}
		if (next !== value) onSave(next);
	}

	if (editing) {
		return (
			<input
				autoFocus
				value={draft}
				maxLength={120}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={commit}
				onKeyDown={(e) => {
					if (e.key === "Enter") commit();
					if (e.key === "Escape") {
						setDraft(value);
						setEditing(false);
					}
				}}
				aria-label="Project title"
				className="-mx-1.5 min-w-0 rounded-md border border-primary bg-surface px-1.5 text-2xl font-semibold tracking-tight outline-none ring-3 ring-primary/15"
			/>
		);
	}
	return (
		<h1 className="group flex min-w-0 items-center gap-1.5 text-2xl font-semibold tracking-tight">
			<span className="min-w-0 wrap-break-word">{value}</span>
			<button
				type="button"
				onClick={startEdit}
				aria-label="Rename project"
				className="grid size-7 cursor-pointer place-items-center rounded-md text-muted opacity-100 transition hover:bg-surface-2 hover:text-fg md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
			>
				<LuPencil className="size-3.5" />
			</button>
		</h1>
	);
}

/** Task progress from project.task_counts, linking to the board. */
function TasksSummaryCard({ project }: { project: Project }) {
	const [, setSp] = useSearchParams();
	const c = project.task_counts;
	const openBoard = () => setSp({ tab: "tasks" }, { replace: true });
	const pct = c?.total ? Math.round((c.completed / c.total) * 100) : 0;
	return (
		<Card className="p-5">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold">Tasks</h2>
				<button type="button" onClick={openBoard} className={buttonGhostClass("py-1 text-xs text-primary hover:text-primary")}>
					Open board
				</button>
			</div>
			{c?.total ? (
				<>
					<div className="mt-3 flex justify-between text-xs">
						<span>
							<span className="font-medium">{c.completed}</span> <span className="text-muted">of {c.total} done</span>
						</span>
						<span className="text-muted">{pct}%</span>
					</div>
					<div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
						<div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
					</div>
					<div className="mt-3 flex flex-wrap gap-1.5">
						{TASK_PRIORITIES.map((p) => {
							const n = c[p.toLowerCase() as "low" | "medium" | "high"];
							return n ? (
								<span key={p} className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", TASK_PRIORITY_META[p].pill)}>
									{n} {TASK_PRIORITY_META[p].label.toLowerCase()} priority open
								</span>
							) : null;
						})}
					</div>
				</>
			) : (
				<p className="mt-2 text-sm text-muted">
					No tasks yet.{" "}
					<button type="button" onClick={openBoard} className="cursor-pointer text-primary hover:underline">
						Add the first one
					</button>
				</p>
			)}
		</Card>
	);
}

function Overview({ project }: { project: Project }) {
	const update = useUpdateProject(project.id);
	const save = (payload: UpdateProjectParams) => update.mutate(payload);

	return (
		<div className="grid gap-4 lg:grid-cols-3">
			<div className="space-y-4 lg:col-span-2">
				<AboutCard
					project={project}
					onSave={(description) => save({ description })}
				/>
				<ScheduleCard project={project} />
				<TasksSummaryCard project={project} />
				<RecentNotesCard project={project} />
			</div>
			<PropertiesCard project={project} onSave={save} />
		</div>
	);
}

function AboutCard({
	project,
	onSave,
}: {
	project: Project;
	onSave: (v: string | null) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(project.description ?? "");
	function startEdit() {
		setDraft(project.description ?? "");
		setEditing(true);
	}

	function commit() {
		const next = draft.trim();
		setEditing(false);
		if (next !== (project.description ?? "").trim()) onSave(next || null);
	}

	return (
		<Card className="p-5">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold">About</h2>
				{editing ? null : (
					<button
						type="button"
						onClick={startEdit}
						className={buttonGhostClass("py-1 text-xs")}
					>
						<LuPencil className="size-3.5" />
						Edit
					</button>
				)}
			</div>
			{editing ? (
				<div className="mt-2">
					<textarea
						autoFocus
						rows={4}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setDraft(project.description ?? "");
								setEditing(false);
							}
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
								commit();
						}}
						placeholder="What is this project about?"
						className={cn(inputClass, "resize-y")}
					/>
					<div className="mt-2 flex justify-end gap-2">
						<Button
							variant="ghost"
							onClick={() => {
								setDraft(project.description ?? "");
								setEditing(false);
							}}
						>
							Cancel
						</Button>
						<Button onClick={commit}>Save</Button>
					</div>
				</div>
			) : project.description?.trim() ? (
				<p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted">
					{project.description}
				</p>
			) : (
				<button
					type="button"
					onClick={startEdit}
					className="mt-2 cursor-pointer text-sm text-muted italic hover:text-primary"
				>
					Add a description…
				</button>
			)}
		</Card>
	);
}

function ScheduleCard({ project }: { project: Project }) {
	const pct = timelinePercent(project);
	const hasRange = Boolean(project.start_date && project.end_date);
	const showToday =
		hasRange && project.status !== "COMPLETED" && pct > 0 && pct < 100;
	return (
		<Card className="p-5">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold">Schedule</h2>
				<DueLabel project={project} className="text-xs" />
			</div>
			{hasRange ? (
				<>
					<div className="relative mt-7">
						<div className="h-2 overflow-hidden rounded-full bg-surface-2">
							<div
								className="h-full rounded-full"
								style={{
									width: `${pct}%`,
									background: projectColor(project),
								}}
							/>
						</div>
						{showToday ? (
							<>
								<div
									className="absolute -top-6 -translate-x-1/2 text-[10px] font-semibold text-primary"
									style={{ left: `${pct}%` }}
								>
									Today
								</div>
								<div
									className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded bg-primary"
									style={{ left: `${pct}%` }}
								/>
							</>
						) : null}
					</div>
					<div className="mt-2 flex justify-between text-xs">
						<span>
							<span className="text-muted">Start</span>{" "}
							<span className="font-medium">
								{formatDay(project.start_date, true)}
							</span>
						</span>
						<span>
							<span className="text-muted">End</span>{" "}
							<span className="font-medium">
								{formatDay(project.end_date, true)}
							</span>
						</span>
					</div>
				</>
			) : (
				<p className="mt-2 text-sm text-muted">
					Set a start and end date in the properties panel to track
					progress against time.
				</p>
			)}
		</Card>
	);
}

function RecentNotesCard({ project }: { project: Project }) {
	const { data, isPending } = useQuery({
		queryKey: [...noteKeys.all, "project", project.id, "recent"],
		queryFn: () =>
			fetchNotes({
				project_id: project.id,
				limit: 4,
				sort_by: "updated_at",
				sort_order: "desc",
			}),
	});
	const notes = data?.notes ?? [];
	return (
		<Card>
			<CardHeader
				title="Recent notes"
				className="px-5"
				action={
					<Link
						to={`/notes/new?projectId=${encodeURIComponent(project.id)}`}
						className={buttonGhostClass(
							"py-1 text-xs text-primary hover:text-primary",
						)}
					>
						<LuPlus className="size-3.5" />
						Add note
					</Link>
				}
			/>
			{isPending ? (
				<div className="space-y-3 p-5">
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-4 w-1/3" />
				</div>
			) : notes.length ? (
				<ul className="divide-y divide-line">
					{notes.map((n) => (
						<li key={n.id}>
							<Link
								to={`/notes/${n.id}`}
								className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/50"
							>
								<LuFileText className="size-4 shrink-0 text-muted" />
								<span className="flex-1 truncate text-sm font-medium">
									{n.title?.trim() || "Untitled note"}
								</span>
								{n.is_pinned ? (
									<LuPin
										className="size-3.5 fill-current text-primary"
										aria-label="Pinned"
									/>
								) : null}
								<span className="shrink-0 text-[11px] text-muted">
									{timeAgo(n.updated_at)}
								</span>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p className="px-5 py-8 text-center text-sm text-muted">
					No notes yet. Capture decisions and specs next to the
					project.
				</p>
			)}
		</Card>
	);
}

function PropertiesCard({
	project,
	onSave,
}: {
	project: Project;
	onSave: (payload: UpdateProjectParams) => void;
}) {
	const start = toDateInputValue(project.start_date);
	const end = toDateInputValue(project.end_date);

	function saveDate(field: "start_date" | "end_date", value: string) {
		const next = value || null;
		const s = field === "start_date" ? value : start;
		const e = field === "end_date" ? value : end;
		if (s && e && e < s) {
			showAlert(
				"Check the dates",
				"warning",
				"The end date can’t be before the start date.",
			);
			return;
		}
		if ((next ?? "") !== (field === "start_date" ? start : end))
			onSave({ [field]: next });
	}

	return (
		<Card className="h-fit px-5 py-2">
			<Prop icon={<LuCircleDot />} label="Status">
				<StatusSelect
					value={project.status}
					onChange={(status) => onSave({ status })}
				/>
			</Prop>
			<Prop icon={<LuCalendar />} label="Start date">
				<DateInput
					value={start}
					onChange={(v) => saveDate("start_date", v)}
					label="Start date"
				/>
			</Prop>
			<Prop icon={<LuFlag />} label="End date">
				<DateInput
					value={end}
					min={start || undefined}
					onChange={(v) => saveDate("end_date", v)}
					label="End date"
				/>
			</Prop>
			<Prop icon={<LuGithub />} label="Repository">
				<RepoInput
					value={project.repo_url ?? ""}
					onSave={(v) => onSave({ repo_url: v || null })}
				/>
			</Prop>
			<Prop icon={<LuPalette />} label="Color">
				<div
					className="flex flex-wrap gap-1"
					role="radiogroup"
					aria-label="Project color"
				>
					{PROJECT_COLOR_SWATCHES.map((c) => {
						const active =
							projectColor(project).toLowerCase() === c;
						return (
							<button
								key={c}
								type="button"
								role="radio"
								aria-checked={active}
								aria-label={c}
								onClick={() => !active && onSave({ color: c })}
								className={cn(
									"size-4 cursor-pointer rounded-full ring-offset-2 ring-offset-surface transition hover:scale-110",
									active && "ring-2",
								)}
								style={{
									background: c,
									["--tw-ring-color" as string]: c,
								}}
							/>
						);
					})}
				</div>
			</Prop>
			<div className="my-1 border-t border-line" />
			<Prop icon={<LuClock />} label="Created">
				<span className="text-muted">
					{formatDay(project.created_at, true)}
				</span>
			</Prop>
			<Prop icon={<LuHistory />} label="Updated">
				<span className="text-muted">
					{timeAgo(project.updated_at)}
				</span>
			</Prop>
		</Card>
	);
}

function Prop({
	icon,
	label,
	children,
}: {
	icon: ReactNode;
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-11 items-center gap-3 py-1.5">
			<span className="flex w-28 shrink-0 items-center gap-2 text-xs text-muted [&>svg]:size-3.5">
				{icon}
				{label}
			</span>
			<div className="min-w-0 flex-1 text-sm">{children}</div>
		</div>
	);
}

const ghostInput =
	"w-full cursor-pointer rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none transition hover:border-line focus:cursor-text focus:border-primary focus:ring-3 focus:ring-primary/15";

function StatusSelect({
	value,
	onChange,
}: {
	value: ProjectStatus;
	onChange: (s: ProjectStatus) => void;
}) {
	return (
		<label className="relative inline-flex cursor-pointer items-center gap-1">
			<ProjectStatusChip status={value} />
			<LuChevronDown className="size-3 text-muted" />
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as ProjectStatus)}
				aria-label="Status"
				className="absolute inset-0 cursor-pointer opacity-0"
			>
				{PROJECT_STATUS_OPTIONS.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</label>
	);
}

function DateInput({
	value,
	min,
	onChange,
	label,
}: {
	value: string;
	min?: string;
	onChange: (v: string) => void;
	label: string;
}) {
	return (
		<input
			type="date"
			value={value}
			min={min || undefined}
			aria-label={label}
			onChange={(e) => onChange(e.target.value)}
			className={cn(ghostInput, "-ml-1.5", !value && "text-muted")}
		/>
	);
}

function RepoInput({
	value,
	onSave,
}: {
	value: string;
	onSave: (v: string) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const href = value ? normalizeRepoUrl(value) : null;

	function commit() {
		setEditing(false);
		if (draft.trim() !== value) onSave(draft.trim());
	}

	if (editing || !value) {
		return (
			<input
				autoFocus={editing}
				type="url"
				value={editing ? draft : value}
				placeholder="Link a repository"
				onChange={(e) => setDraft(e.target.value)}
				onFocus={() => {
					if (!editing) {
						setDraft(value);
						setEditing(true);
					}
				}}
				onBlur={commit}
				onKeyDown={(e) => {
					if (e.key === "Enter")
						(e.target as HTMLInputElement).blur();
					if (e.key === "Escape") {
						setDraft(value);
						setEditing(false);
					}
				}}
				aria-label="Repository URL"
				className={cn(
					ghostInput,
					"-ml-1.5 font-mono text-xs placeholder:font-sans placeholder:text-muted",
				)}
			/>
		);
	}
	return (
		<div className="flex min-w-0 items-center gap-1">
			<a
				href={href ?? undefined}
				target="_blank"
				rel="noopener noreferrer"
				className="flex min-w-0 items-center gap-1 font-mono text-xs text-primary hover:underline"
			>
				<span className="truncate">{repoDisplayName(value)}</span>
				<LuExternalLink className="size-3 shrink-0" />
			</a>
			<button
				type="button"
				onClick={() => {
					setDraft(value);
					setEditing(true);
				}}
				aria-label="Edit repository URL"
				className="grid size-6 shrink-0 cursor-pointer place-items-center rounded text-muted hover:bg-surface-2 hover:text-fg"
			>
				<LuPencil className="size-3" />
			</button>
		</div>
	);
}

function ProjectSkeleton() {
	return (
		<Page>
			<div className="flex items-start gap-4">
				<Skeleton className="size-12 rounded-xl" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-7 w-64 max-w-full" />
					<Skeleton className="h-3 w-48" />
				</div>
			</div>
			<Skeleton className="mt-6 h-9 w-80 max-w-full" />
			<div className="mt-5 grid gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<Skeleton className="h-28 rounded-xl" />
					<Skeleton className="h-28 rounded-xl" />
				</div>
				<Skeleton className="h-72 rounded-xl" />
			</div>
		</Page>
	);
}

import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
	LuCalendarDays,
	LuCalendarRange,
	LuChevronLeft,
	LuChevronRight,
	LuCircle,
	LuCircleCheck,
	LuCircleDot,
	LuFlag,
	LuListTodo,
	LuPlay,
} from "react-icons/lu";

import { Page } from "@/components/layout/AppShell";
import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { DueLabel } from "@/components/project/ProjectTimeline";
import { useShell } from "@/components/layout/shell-context";
import Button from "@/components/ui/Button";
import {
	Card,
	EmptyState,
	ErrorState,
	Skeleton,
	cardClass,
} from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import {
	formatDay,
	parseDay,
	projectColor,
	toDayValue,
	today,
} from "@/lib/project/projectDisplay";
import { useAllProjects } from "@/lib/queries";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/task/taskDisplay";
import { useTasksDue } from "@/lib/taskQueries";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import type { CalendarTask } from "@/types/task";

const DAY = 86_400_000;
const MAX_BARS = 3;
/** How far ahead "Coming up" looks for tasks. */
const UPCOMING_TASK_DAYS = 30;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Dated = Project & { start: Date; end: Date };
type AgendaItem =
	| { date: Date; kind: "Starts" | "Due"; project: Dated }
	| { date: Date; kind: "Task"; task: CalendarTask };
type ProjectAgendaItem = Extract<AgendaItem, { kind: "Starts" | "Due" }>;

const agendaKey = (a: AgendaItem) =>
	a.kind === "Task" ? `task-${a.task.id}` : `${a.project.id}-${a.kind}`;
const agendaHref = (a: AgendaItem) =>
	a.kind === "Task" ? taskHref(a.task) : `/projects/${a.project.id}`;
const agendaColor = (a: AgendaItem) =>
	projectColor(a.kind === "Task" ? a.task.project : a.project);
const agendaTitle = (a: AgendaItem) =>
	a.kind === "Task" ? a.task.title : a.project.title;
const agendaSub = (a: AgendaItem) =>
	a.kind === "Task" ? `Task · ${a.task.project.title}` : a.kind;

/** Opens the task on its project's board. */
function taskHref(t: CalendarTask) {
	return `/projects/${t.project_id}?tab=tasks&task=${t.id}`;
}

function taskItem(t: CalendarTask): AgendaItem[] {
	const date = parseDay(t.due_date);
	return date ? [{ date, kind: "Task", task: t }] : [];
}

const isOpenTask = (t: CalendarTask) => t.status !== "DONE";

function sameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** Six Monday-first weeks covering the given month. */
function monthGrid(year: number, month: number): Date[][] {
	const first = new Date(year, month, 1, 12);
	const offset = (first.getDay() + 6) % 7;
	return Array.from({ length: 6 }, (_, w) =>
		Array.from(
			{ length: 7 },
			(_, d) => new Date(year, month, 1 - offset + w * 7 + d, 12),
		),
	);
}

export function CalendarPage() {
	const now = today();
	const [cursor, setCursor] = useState({
		y: now.getFullYear(),
		m: now.getMonth(),
	});
	const [mode, setMode] = useState<"month" | "agenda">("month");
	const [selected, setSelected] = useState<Date>(now);
	const { openCreateProject } = useShell();
	const { data, isPending, isError, error, refetch, isRefetching } =
		useAllProjects();

	const dated = useMemo<Dated[]>(
		() =>
			(data?.projects ?? []).flatMap((p) => {
				const start = parseDay(p.start_date) ?? parseDay(p.end_date);
				const end = parseDay(p.end_date) ?? parseDay(p.start_date);
				return start && end
					? [{ ...p, start, end: end < start ? start : end }]
					: [];
			}),
		[data],
	);
	const undated = (data?.projects.length ?? 0) - dated.length;

	const weeks = monthGrid(cursor.y, cursor.m);
	const monthStart = new Date(cursor.y, cursor.m, 1, 12);
	const monthEnd = new Date(cursor.y, cursor.m + 1, 0, 12);

	// Tasks for the six visible weeks (42 days, inside the API's 62-day limit),
	// plus the next month of open tasks for "Coming up".
	const gridTasks = useTasksDue(
		toDayValue(weeks[0][0]),
		toDayValue(weeks[5][6]),
	);
	const soonTasks = useTasksDue(
		toDayValue(now),
		toDayValue(new Date(now.getTime() + UPCOMING_TASK_DAYS * DAY)),
	);
	const tasksByDay = useMemo(() => {
		const map = new Map<string, CalendarTask[]>();
		for (const t of gridTasks.data?.tasks ?? []) {
			if (!t.due_date) continue;
			const key = t.due_date.slice(0, 10);
			map.set(key, [...(map.get(key) ?? []), t]);
		}
		return map;
	}, [gridTasks.data]);
	const tasksOn = (d: Date) => tasksByDay.get(toDayValue(d)) ?? [];

	const agenda = useMemo<ProjectAgendaItem[]>(() => {
		const items: ProjectAgendaItem[] = [];
		for (const p of dated) {
			if (p.start_date)
				items.push({ date: p.start, kind: "Starts", project: p });
			if (p.end_date)
				items.push({ date: p.end, kind: "Due", project: p });
		}
		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	}, [dated]);
	const byDate = (a: AgendaItem, b: AgendaItem) =>
		a.date.getTime() - b.date.getTime();
	const inMonth = (a: AgendaItem) => a.date >= monthStart && a.date <= monthEnd;
	const monthAgenda = [
		...agenda,
		...(gridTasks.data?.tasks ?? []).flatMap(taskItem),
	]
		.filter(inMonth)
		.sort(byDate);
	const upcoming = [
		...agenda.filter(
			(a) =>
				a.project.status !== "COMPLETED" &&
				a.project.status !== "ABANDONED",
		),
		...(soonTasks.data?.tasks ?? []).filter(isOpenTask).flatMap(taskItem),
	]
		.filter((a) => a.date >= now)
		.sort(byDate)
		.slice(0, 8);
	const nothingThisMonth = `Nothing starts, ends or is due in ${monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" })}.`;

	const shift = (n: number) =>
		setCursor(({ y, m }) => {
			const d = new Date(y, m + n, 1);
			return { y: d.getFullYear(), m: d.getMonth() };
		});
	/** Select a date; picking one from the previous/next month also moves there. */
	const selectDay = (d: Date) => {
		setSelected(d);
		if (d.getMonth() !== cursor.m || d.getFullYear() !== cursor.y)
			setCursor({ y: d.getFullYear(), m: d.getMonth() });
	};
	const goToday = () => selectDay(now);
	const onCurrentMonth =
		cursor.y === now.getFullYear() && cursor.m === now.getMonth();
	const label = monthStart.toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	});

	return (
		<Page>
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="min-w-44 text-2xl font-semibold tracking-tight">
					{label}
				</h1>
				<div
					className="flex items-center overflow-hidden rounded-lg border border-line bg-surface"
					role="group"
					aria-label="Change month"
				>
					<button
						type="button"
						onClick={() => shift(-1)}
						title="Previous month"
						aria-label="Previous month"
						className="grid h-8 w-9 cursor-pointer place-items-center text-muted transition hover:bg-surface-2 hover:text-fg"
					>
						<LuChevronLeft className="size-4" />
					</button>
					<button
						type="button"
						onClick={goToday}
						title="Jump to today"
						className={cn(
							"h-8 cursor-pointer border-x border-line px-3 text-xs font-medium transition hover:bg-surface-2",
							onCurrentMonth && sameDay(selected, now)
								? "text-muted"
								: "text-primary",
						)}
					>
						Today
					</button>
					<button
						type="button"
						onClick={() => shift(1)}
						title="Next month"
						aria-label="Next month"
						className="grid h-8 w-9 cursor-pointer place-items-center text-muted transition hover:bg-surface-2 hover:text-fg"
					>
						<LuChevronRight className="size-4" />
					</button>
				</div>
				<Segmented
					className="ml-auto max-md:hidden"
					ariaLabel="Calendar view"
					value={mode}
					onChange={setMode}
					options={[
						{ value: "month", label: "Month" },
						{ value: "agenda", label: "Agenda" },
					]}
				/>
			</div>

			{isError ? (
				<ErrorState
					className="mt-5"
					title="Could not load projects"
					message={getRequestErrorMessage(
						error,
						"Something went wrong while loading the calendar.",
					)}
					onRetry={() => void refetch()}
					retrying={isRefetching}
				/>
			) : isPending ? (
				<Skeleton className="mt-5 h-128 rounded-xl" />
			) : data.projects.length === 0 ? (
				<Card className="mt-5">
					<EmptyState
						icon={<LuCalendarDays />}
						title="Nothing on the calendar yet"
						description="Projects show up here once they have a start or end date, and tasks once they have a due date."
						action={
							<Button onClick={openCreateProject}>
								New project
							</Button>
						}
					/>
				</Card>
			) : (
				<>
					{/* Desktop */}
					<div className="mt-5 gap-4 max-md:hidden md:grid xl:grid-cols-[1fr_18rem]">
						{mode === "month" ? (
							<div className={cn(cardClass, "overflow-hidden")}>
								<div className="grid grid-cols-7 border-b border-line bg-surface-2/50">
									{WEEKDAYS.map((d) => (
										<div
											key={d}
											className="px-2 py-2 text-[11px] font-medium tracking-wider text-muted uppercase"
										>
											{d}
										</div>
									))}
								</div>
								{weeks.map((week) => (
									<WeekRow
										key={week[0].toISOString()}
										week={week}
										month={cursor.m}
										projects={dated}
										tasksOn={tasksOn}
										now={now}
										selected={selected}
										onSelect={selectDay}
									/>
								))}
							</div>
						) : (
							<AgendaList
								items={monthAgenda}
								emptyLabel={nothingThisMonth}
							/>
						)}
						<div className="space-y-4">
							<DayDetails
								day={selected}
								now={now}
								projects={dated}
								tasks={tasksOn(selected)}
							/>
							<aside className={cn(cardClass, "h-fit p-4")}>
								<h2 className="text-sm font-semibold">
									Coming up
								</h2>
								{upcoming.length ? (
									<ul className="mt-3 space-y-3">
										{upcoming.map((a) => (
											<li key={agendaKey(a)}>
												<Link
													to={agendaHref(a)}
													className="group flex items-center gap-3"
												>
													<span
														className="h-8 w-1 shrink-0 rounded-full"
														style={{
															background:
																agendaColor(a),
														}}
													/>
													<span className="min-w-0 flex-1">
														<span className="block truncate text-sm font-medium group-hover:text-primary">
															{agendaTitle(a)}
														</span>
														<span className="block truncate text-[11px] text-muted">
															{agendaSub(a)} ·{" "}
															{a.date.toLocaleDateString(
																undefined,
																{
																	month: "short",
																	day: "numeric",
																},
															)}
														</span>
													</span>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="mt-2 text-sm text-muted">
										No upcoming starts or deadlines.
									</p>
								)}
								<p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
									Click any date to see what’s on it. Bars run
									from each project’s start date to its end
									date; ⚑ marks the deadline. The number on a
									date counts the tasks due that day.
									{gridTasks.isError
										? " Tasks couldn’t be loaded right now."
										: ""}
									{undated > 0
										? ` ${undated} project${undated === 1 ? " has" : "s have"} no dates.`
										: ""}
								</p>
							</aside>
						</div>
					</div>

					{/* Mobile */}
					<div className="mt-4 space-y-4 md:hidden">
						<div className={cn(cardClass, "p-3")}>
							<div className="grid grid-cols-7 text-center text-[10px] font-medium text-muted">
								{WEEKDAYS.map((d) => (
									<span key={d}>{d[0]}</span>
								))}
							</div>
							<div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
								{weeks.flat().map((d) => {
									const marks = [
										...agenda
											.filter((a) => sameDay(a.date, d))
											.map((a) => ({
												key: agendaKey(a),
												color: agendaColor(a),
											})),
										...tasksOn(d).map((t) => ({
											key: t.id,
											color: projectColor(t.project),
										})),
									];
									return (
										<button
											type="button"
											key={d.toISOString()}
											onClick={() => selectDay(d)}
											aria-pressed={sameDay(d, selected)}
											aria-label={d.toLocaleDateString(
												undefined,
												{
													weekday: "long",
													month: "long",
													day: "numeric",
												},
											)}
											className={cn(
												"relative mx-auto grid size-9 cursor-pointer place-items-center rounded-full text-xs transition",
												sameDay(d, now)
													? "bg-primary font-semibold text-white"
													: "hover:bg-surface-2",
												sameDay(d, selected) &&
													!sameDay(d, now) &&
													"bg-primary/10 font-semibold text-primary ring-2 ring-primary/40",
												sameDay(d, selected) &&
													sameDay(d, now) &&
													"ring-2 ring-primary/40 ring-offset-2 ring-offset-surface",
												d.getMonth() !== cursor.m &&
													!sameDay(d, now) &&
													!sameDay(d, selected) &&
													"text-muted/50",
											)}
										>
											{d.getDate()}
											{marks.length ? (
												<span className="absolute bottom-1 flex gap-0.5">
													{marks
														.slice(0, 3)
														.map((m) => (
															<span
																key={m.key}
																className="size-1 rounded-full"
																style={{
																	background:
																		m.color,
																}}
															/>
														))}
												</span>
											) : null}
										</button>
									);
								})}
							</div>
						</div>
						<DayDetails
							day={selected}
							now={now}
							projects={dated}
							tasks={tasksOn(selected)}
						/>
						<div>
							<p className="mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
								This month
							</p>
							<AgendaList
								items={monthAgenda}
								emptyLabel={nothingThisMonth}
							/>
						</div>
					</div>
				</>
			)}
		</Page>
	);
}

type WeekRowProps = {
	week: Date[];
	month: number;
	projects: Dated[];
	tasksOn: (d: Date) => CalendarTask[];
	now: Date;
	selected: Date;
	onSelect: (d: Date) => void;
};

function WeekRow({
	week,
	month,
	projects,
	tasksOn,
	now,
	selected,
	onSelect,
}: WeekRowProps) {
	const ws = week[0];
	const we = week[6];
	const inWeek = projects
		.filter((p) => p.start <= we && p.end >= ws)
		.sort(
			(a, b) =>
				a.start.getTime() - b.start.getTime() ||
				a.title.localeCompare(b.title),
		);
	const bars = inWeek.slice(0, MAX_BARS);
	const hidden = inWeek.length - bars.length;

	return (
		<div className="relative grid min-h-32 grid-cols-7 border-b border-line last:border-b-0">
			{week.map((d) => {
			const isSelected = sameDay(d, selected);
			const tasks = tasksOn(d);
			const open = tasks.filter(isOpenTask).length;
			const overdue = open > 0 && d < now;
			const dayLabel = d.toLocaleDateString(undefined, {
				weekday: "long",
				month: "long",
				day: "numeric",
			});
			return (
					<button
						type="button"
						key={d.toISOString()}
						onClick={() => onSelect(d)}
						aria-pressed={isSelected}
						aria-label={dayLabel}
						title={
							tasks.length
								? `${tasks.length} task${tasks.length === 1 ? "" : "s"} due${open < tasks.length ? `, ${tasks.length - open} done` : ""}`
								: undefined
						}
						className={cn(
							"flex cursor-pointer items-start justify-between gap-1 border-r border-line p-1.5 text-left transition-colors last:border-r-0 hover:bg-primary/5",
							d.getMonth() !== month && "bg-surface-2/40",
							isSelected &&
								"bg-primary/8 shadow-[inset_0_0_0_2px_var(--color-primary)]",
						)}
					>
						<span
							className={cn(
								"grid size-6 place-items-center rounded-full text-xs",
								sameDay(d, now)
									? "bg-primary font-semibold text-white"
									: isSelected
										? "font-semibold text-primary"
										: d.getMonth() !== month
											? "text-muted/60"
											: "text-muted",
							)}
						>
							{d.getDate()}
						</span>
						{tasks.length ? (
							<span
								aria-hidden
								className={cn(
									"inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-[10px] font-semibold",
									overdue
										? "bg-red-500/10 text-red-600 dark:text-red-400"
										: open
											? "bg-primary/10 text-primary"
											: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
								)}
							>
								{open ? (
									<LuListTodo className="size-3" />
								) : (
									<LuCircleCheck className="size-3" />
								)}
								{open || tasks.length}
							</span>
						) : null}
					</button>
				);
			})}
			<div className="pointer-events-none absolute inset-x-0 top-9 grid grid-cols-7 gap-y-1">
				{bars.map((p, row) => {
					const s = Math.max(
						0,
						Math.round(
							(Math.max(p.start.getTime(), ws.getTime()) -
								ws.getTime()) /
								DAY,
						),
					);
					const e = Math.min(
						6,
						Math.round(
							(Math.min(p.end.getTime(), we.getTime()) -
								ws.getTime()) /
								DAY,
						),
					);
					const isStart = p.start >= ws;
					const isEnd = p.end <= we;
					const color = projectColor(p);
					return (
						<button
							type="button"
							key={p.id}
							title={`${p.title}: click to see this day`}
							// A bar spans several days; select the day under the pointer.
							onClick={(ev) => {
								const rect =
									ev.currentTarget.getBoundingClientRect();
								const span = e - s + 1;
								const offset = Math.min(
									span - 1,
									Math.max(
										0,
										Math.floor(
											((ev.clientX - rect.left) /
												rect.width) *
												span,
										),
									),
								);
								onSelect(week[s + offset]);
							}}
							className={cn(
								"pointer-events-auto mx-1 cursor-pointer truncate px-1.5 py-0.5 text-left text-[10px] font-semibold transition hover:brightness-110",
								isStart && "rounded-l-md",
								isEnd && "rounded-r-md",
							)}
							style={{
								gridColumn: `${s + 1} / ${e + 2}`,
								gridRow: row + 1,
								background: `color-mix(in srgb, ${color} 16%, transparent)`,
								color,
								boxShadow: isStart
									? `inset 3px 0 0 ${color}`
									: undefined,
							}}
						>
							{isStart || s === 0 ? p.title : " "}
							{isEnd && p.end_date ? " ⚑" : ""}
						</button>
					);
				})}
				{hidden > 0 ? (
					<span
						className="col-span-7 px-2 text-[10px] text-muted"
						style={{ gridRow: MAX_BARS + 1 }}
					>
						+{hidden} more this week
					</span>
				) : null}
			</div>
		</div>
	);
}

/** Everything happening on one date: projects starting, due, and still running. */
function DayDetails({
	day,
	now,
	projects,
	tasks,
}: {
	day: Date;
	now: Date;
	projects: Dated[];
	/** Tasks due on this day. */
	tasks: CalendarTask[];
}) {
	const starts = projects.filter(
		(p) => p.start_date && sameDay(p.start, day),
	);
	const due = projects.filter((p) => p.end_date && sameDay(p.end, day));
	const ongoing = projects.filter(
		(p) =>
			p.start < day &&
			p.end > day &&
			!starts.includes(p) &&
			!due.includes(p),
	);
	const isToday = sameDay(day, now);
	const diff = Math.round((day.getTime() - now.getTime()) / DAY);
	const relative = isToday
		? "Today"
		: diff === 1
			? "Tomorrow"
			: diff === -1
				? "Yesterday"
				: diff > 0
					? `In ${diff} days`
					: `${-diff} days ago`;
	const empty =
		!starts.length && !due.length && !ongoing.length && !tasks.length;

	return (
		<section aria-live="polite" className={cn(cardClass, "p-4")}>
			<p
				className={cn(
					"text-[11px] font-semibold tracking-wider uppercase",
					isToday ? "text-primary" : "text-muted",
				)}
			>
				{relative}
			</p>
			<h2 className="mt-0.5 text-base font-semibold">
				{day.toLocaleDateString(undefined, {
					weekday: "long",
					month: "long",
					day: "numeric",
					year:
						day.getFullYear() !== now.getFullYear()
							? "numeric"
							: undefined,
				})}
			</h2>
			{empty ? (
				<p className="mt-3 text-sm text-muted">
					Nothing scheduled on this day.
				</p>
			) : (
				<div className="mt-3 space-y-4">
					<DayGroup
						title="Due"
						icon={<LuFlag />}
						tone="text-amber-600 dark:text-amber-400"
						items={due}
					/>
					<TaskGroup tasks={tasks} overdue={day < now} />
					<DayGroup
						title="Starts"
						icon={<LuPlay />}
						tone="text-emerald-600 dark:text-emerald-400"
						items={starts}
					/>
					<DayGroup
						title="Ongoing"
						icon={<LuCalendarRange />}
						tone="text-muted"
						items={ongoing}
						showRange
					/>
				</div>
			)}
		</section>
	);
}

function DayGroup({
	title,
	icon,
	tone,
	items,
	showRange = false,
}: {
	title: string;
	icon: React.ReactNode;
	tone: string;
	items: Dated[];
	showRange?: boolean;
}) {
	if (!items.length) return null;
	return (
		<div>
			<p
				className={cn(
					"flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase [&>svg]:size-3",
					tone,
				)}
			>
				{icon}
				{title}{" "}
				<span className="font-normal text-muted">{items.length}</span>
			</p>
			<ul className="mt-1.5 space-y-1">
				{items.map((p) => (
					<li key={p.id}>
						<Link
							to={`/projects/${p.id}`}
							className="group flex items-center gap-2.5 rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-surface-2"
						>
							<span
								className="h-8 w-1 shrink-0 rounded-full"
								style={{ background: projectColor(p) }}
							/>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-medium group-hover:text-primary">
									{p.title}
								</span>
								<span className="text-[11px] text-muted">
									{showRange ? (
										<>
											{formatDay(p.start_date)} →{" "}
											{formatDay(p.end_date)} ·{" "}
											<DueLabel
												project={p}
												className="font-normal"
											/>
										</>
									) : (
										<DueLabel
											project={p}
											className="font-normal"
										/>
									)}
								</span>
							</span>
							<ProjectStatusChip
								status={p.status}
								className="shrink-0"
							/>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Tasks due on the selected day, open ones first. */
function TaskGroup({ tasks, overdue }: { tasks: CalendarTask[]; overdue: boolean }) {
	if (!tasks.length) return null;
	const sorted = [...tasks].sort(
		(a, b) => Number(a.status === "DONE") - Number(b.status === "DONE"),
	);
	const done = tasks.length - tasks.filter(isOpenTask).length;
	return (
		<div>
			<p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase [&>svg]:size-3">
				<LuListTodo />
				Tasks due{" "}
				<span className="font-normal text-muted">
					{tasks.length}
					{done ? ` · ${done} done` : ""}
				</span>
			</p>
			<ul className="mt-1.5 space-y-1">
				{sorted.map((t) => {
					const isDone = t.status === "DONE";
					const late = overdue && !isDone;
					const StatusIcon = isDone
						? LuCircleCheck
						: t.status === "IN_PROGRESS"
							? LuCircleDot
							: LuCircle;
					return (
						<li key={t.id}>
							<Link
								to={taskHref(t)}
								className="group -mx-1.5 flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
							>
								<StatusIcon
									aria-label={TASK_STATUS_META[t.status].label}
									className={cn(
										"size-4 shrink-0",
										isDone
											? "text-emerald-500"
											: t.status === "IN_PROGRESS"
												? "text-primary"
												: "text-muted",
									)}
								/>
								<span className="min-w-0 flex-1">
									<span
										className={cn(
											"block truncate text-sm font-medium group-hover:text-primary",
											isDone && "text-muted line-through",
										)}
									>
										{t.title}
									</span>
									<span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
										<span
											className="size-2 shrink-0 rounded-full"
											style={{ background: projectColor(t.project) }}
										/>
										<span className="truncate">{t.project.title}</span>
										{late ? (
											<span className="shrink-0 font-medium text-red-600 dark:text-red-400">
												· Overdue
											</span>
										) : null}
									</span>
								</span>
								{isDone ? null : (
									<span
										className={cn(
											"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
											TASK_PRIORITY_META[t.priority].pill,
										)}
									>
										{TASK_PRIORITY_META[t.priority].label}
									</span>
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function AgendaList({
	items,
	emptyLabel,
}: {
	items: AgendaItem[];
	emptyLabel: string;
}) {
	if (!items.length) {
		return (
			<div
				className={cn(cardClass, "p-8 text-center text-sm text-muted")}
			>
				{emptyLabel}
			</div>
		);
	}
	return (
		<div className={cn(cardClass, "divide-y divide-line")}>
			{items.map((a) => (
				<Link
					key={agendaKey(a)}
					to={agendaHref(a)}
					className="flex items-center gap-3 p-3 transition-colors hover:bg-surface-2/50"
				>
					<div className="w-10 shrink-0 text-center">
						<p className="text-[10px] text-muted uppercase">
							{a.date.toLocaleDateString(undefined, {
								month: "short",
							})}
						</p>
						<p className="text-sm font-semibold">
							{a.date.getDate()}
						</p>
					</div>
					<span
						className="h-8 w-1 shrink-0 rounded-full"
						style={{ background: agendaColor(a) }}
					/>
					<div className="min-w-0 flex-1">
						<p
							className={cn(
								"truncate text-sm font-medium",
								a.kind === "Task" &&
									a.task.status === "DONE" &&
									"text-muted line-through",
							)}
						>
							{agendaTitle(a)}
						</p>
						<p className="truncate text-[11px] text-muted">{agendaSub(a)}</p>
					</div>
					{a.kind === "Task" ? (
						<LuListTodo className="size-4 shrink-0 text-muted" aria-hidden />
					) : null}
				</Link>
			))}
		</div>
	);
}

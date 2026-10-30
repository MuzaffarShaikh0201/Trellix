import { useMemo, useState, type DragEvent } from "react";
import { useSearchParams } from "react-router";
import { LuArrowRightLeft, LuCalendar, LuCheck, LuListTodo, LuPlus } from "react-icons/lu";

import { TaskDialog } from "@/components/task/TaskDialog";
import Button from "@/components/ui/Button";
import { Card, EmptyState, ErrorState, Skeleton } from "@/components/ui/Card";
import { inputClass } from "@/components/ui/fieldStyles";
import { Segmented } from "@/components/ui/Segmented";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { daysUntil, formatDay } from "@/lib/project/projectDisplay";
import { TASK_PRIORITIES, TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/task/taskDisplay";
import {
	TASK_STATUSES,
	groupTasks,
	useCreateTask,
	useDeleteTask,
	useMoveTask,
	useTasks,
	useUpdateTask,
} from "@/lib/taskQueries";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

type DropTarget = { status: TaskStatus; index: number } | null;

export function TaskBoard({ projectId }: { projectId: string }) {
	const { data, isPending, isError, error, refetch, isRefetching } = useTasks(projectId);
	const create = useCreateTask(projectId);
	const update = useUpdateTask(projectId);
	const move = useMoveTask(projectId);
	const del = useDeleteTask(projectId);
	const canDrag = useMediaQuery("(pointer: fine)");

	const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
	// The open task lives in the URL (?task=…) so notifications and the calendar can link to it.
	const [sp, setSp] = useSearchParams();
	const editingId = sp.get("task");
	const setEditingId = (id: string | null) =>
		setSp(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (id) next.set("task", id);
				else next.delete("task");
				return next;
			},
			{ replace: true },
		);
	const [dragId, setDragId] = useState<string | null>(null);
	const [drop, setDrop] = useState<DropTarget>(null);

	const tasks = useMemo(() => data?.tasks ?? [], [data]);
	const groups = useMemo(() => groupTasks(tasks), [tasks]);
	const filtering = priority !== "ALL";
	// Reordering a filtered column would use the wrong positions, so dragging needs the full list.
	const dragEnabled = canDrag && !filtering;
	const done = groups.DONE.length;
	const editing = tasks.find((t) => t.id === editingId) ?? null;

	if (isError) {
		return (
			<ErrorState
				title="Could not load tasks"
				message={getRequestErrorMessage(error, "Something went wrong while loading tasks.")}
				onRetry={() => void refetch()}
				retrying={isRefetching}
			/>
		);
	}
	if (isPending) {
		return (
			<div className="grid gap-3 md:grid-cols-3">
				{TASK_STATUSES.map((s) => (
					<Skeleton key={s} className="h-64 rounded-xl" />
				))}
			</div>
		);
	}

	function moveTo(task: Task, status: TaskStatus, index: number) {
		if (task.status === status && task.position === index) return;
		move.mutate({ id: task.id, status, position: index });
	}

	function toggleDone(task: Task) {
		if (task.status === "DONE") moveTo(task, "TODO", groups.TODO.length);
		else moveTo(task, "DONE", 0);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		const task = tasks.find((t) => t.id === dragId);
		if (task && drop) moveTo(task, drop.status, drop.index);
		setDragId(null);
		setDrop(null);
	}

	if (tasks.length === 0) {
		return (
			<Card>
				<EmptyState
					icon={<LuListTodo />}
					title="No tasks yet"
					description="Break this project into tasks and track them across To do, In progress and Done."
					action={<QuickAdd label="Add the first task" onAdd={(title) => create.mutate({ title, status: "TODO" })} pending={create.isPending} solo />}
				/>
			</Card>
		);
	}

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<div className="min-w-48 flex-1">
					<div className="flex justify-between text-xs">
						<span className="font-medium">
							{done} of {tasks.length} done
						</span>
						<span className="text-muted">{Math.round((done / tasks.length) * 100)}%</span>
					</div>
					<div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
						<div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${(done / tasks.length) * 100}%` }} />
					</div>
				</div>
				<Segmented
					ariaLabel="Filter by priority"
					value={priority}
					onChange={setPriority}
					options={[
						{ value: "ALL", label: "All" },
						...TASK_PRIORITIES.map((p) => ({
							value: p,
							label: TASK_PRIORITY_META[p].label,
							icon: <span className={cn("size-1.5 rounded-full", TASK_PRIORITY_META[p].dot)} />,
						})),
					]}
				/>
			</div>

			<div className="custom-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
				{TASK_STATUSES.map((status) => {
					const column = groups[status];
					const visible = filtering ? column.filter((t) => t.priority === priority) : column;
					// Positions are computed without the card being dragged, matching the server.
					const others = column.filter((t) => t.id !== dragId);
					const isTarget = drop?.status === status;
					return (
						<section
							key={status}
							aria-label={TASK_STATUS_META[status].label}
							onDragOver={(e) => {
								if (!dragId) return;
								e.preventDefault();
								if (!isTarget) setDrop({ status, index: others.length });
							}}
							onDrop={handleDrop}
							className={cn(
								"flex w-72 shrink-0 snap-start flex-col rounded-xl bg-surface-2/60 p-2 transition md:w-auto",
								isTarget && "ring-2 ring-primary/40",
							)}
						>
							<header className="flex items-center gap-2 px-2 py-1.5">
								<span className={cn("size-2 rounded-full", TASK_STATUS_META[status].dot)} />
								<h3 className="text-xs font-semibold">{TASK_STATUS_META[status].label}</h3>
								<span className="text-xs text-muted">{visible.length}</span>
							</header>
							<ol className="mt-1 space-y-2">
								{visible.map((task) => {
									const index = others.findIndex((t) => t.id === task.id);
									return (
										<li key={task.id}>
											{isTarget && drop?.index === index && dragId !== task.id ? <DropLine /> : null}
											<TaskCard
												task={task}
												draggable={dragEnabled}
												dragging={dragId === task.id}
												onOpen={() => setEditingId(task.id)}
												onToggleDone={() => toggleDone(task)}
												onMove={(s) => moveTo(task, s, s === "DONE" ? 0 : groups[s].filter((t) => t.id !== task.id).length)}
												onDragStart={(e) => {
													e.dataTransfer.effectAllowed = "move";
													e.dataTransfer.setData("text/plain", task.id);
													setDragId(task.id);
												}}
												onDragEnd={() => {
													setDragId(null);
													setDrop(null);
												}}
												onDragOver={(e) => {
													if (!dragId || dragId === task.id) return;
													e.preventDefault();
													e.stopPropagation();
													const rect = e.currentTarget.getBoundingClientRect();
													const after = e.clientY > rect.top + rect.height / 2;
													const next = { status, index: index + (after ? 1 : 0) };
													if (drop?.status !== next.status || drop.index !== next.index) setDrop(next);
												}}
											/>
										</li>
									);
								})}
								{isTarget && drop?.index === others.length ? (
									<li>
										<DropLine />
									</li>
								) : null}
							</ol>
							{visible.length === 0 && !isTarget ? (
								<p className="mt-1 rounded-lg border border-dashed border-line px-3 py-5 text-center text-xs text-muted">
									{filtering ? "No tasks with this priority" : dragEnabled ? "Drop a task here" : "Nothing here yet"}
								</p>
							) : null}
							{status === "DONE" ? null : (
								<QuickAdd
									label="Add task"
									pending={create.isPending}
									onAdd={(title) =>
										create.mutate({ title, status, priority: filtering ? (priority as TaskPriority) : undefined })
									}
								/>
							)}
						</section>
					);
				})}
			</div>
			{canDrag && filtering ? (
				<p className="mt-3 text-xs text-muted">Show all priorities to reorder tasks by dragging.</p>
			) : null}

			{editing ? (
				<TaskDialog
					key={editing.id}
					task={editing}
					onClose={() => setEditingId(null)}
					onSave={(payload) => update.mutate({ id: editing.id, payload })}
					onMove={(s) => moveTo(editing, s, s === "DONE" ? 0 : groups[s].length)}
					onDelete={() => del.mutate(editing.id)}
				/>
			) : null}
		</div>
	);
}

function DropLine() {
	return <div aria-hidden className="mb-2 h-0.5 rounded-full bg-primary" />;
}

type TaskCardProps = {
	task: Task;
	draggable: boolean;
	dragging: boolean;
	onOpen: () => void;
	onToggleDone: () => void;
	onMove: (status: TaskStatus) => void;
	onDragStart: (e: DragEvent<HTMLDivElement>) => void;
	onDragEnd: () => void;
	onDragOver: (e: DragEvent<HTMLDivElement>) => void;
};

function TaskCard({ task, draggable, dragging, onOpen, onToggleDone, onMove, onDragStart, onDragEnd, onDragOver }: TaskCardProps) {
	const done = task.status === "DONE";
	const dueIn = daysUntil(task.due_date);
	const overdue = !done && dueIn !== null && dueIn < 0;
	const prio = TASK_PRIORITY_META[task.priority];

	return (
		<div
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			className={cn(
				"group relative rounded-xl border border-line bg-surface p-3 transition hover:border-primary/40",
				draggable && "cursor-grab active:cursor-grabbing",
				dragging && "opacity-40",
			)}
		>
			<div className="flex items-start gap-2">
				<button
					type="button"
					onClick={onToggleDone}
					aria-label={done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
					aria-pressed={done}
					className={cn(
						"relative z-10 mt-0.5 grid size-4 shrink-0 cursor-pointer place-items-center rounded-full border transition",
						done ? "border-emerald-500 bg-emerald-500 text-white" : "border-line hover:border-emerald-500",
					)}
				>
					{done ? <LuCheck className="size-2.5" /> : null}
				</button>
				<button
					type="button"
					onClick={onOpen}
					className={cn(
						"min-w-0 flex-1 cursor-pointer text-left text-sm outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-primary/40",
						done && "text-muted line-through",
					)}
				>
					{task.title}
				</button>
			</div>
			{task.description ? (
				<p className="mt-1 line-clamp-2 pl-6 text-xs text-muted">{task.description}</p>
			) : null}
			<div className="mt-2 flex items-center gap-1.5 pl-6">
				<span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", prio.pill)}>{prio.label}</span>
				{task.due_date ? (
					<span
						className={cn(
							"inline-flex items-center gap-1 text-[11px]",
							overdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted",
						)}
					>
						<LuCalendar className="size-3" />
						{formatDay(task.due_date)}
					</span>
				) : null}
				<label
					title="Move to…"
					className={cn(
						"relative z-10 ml-auto grid size-6 cursor-pointer place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg",
						draggable && "md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100",
					)}
				>
					<LuArrowRightLeft className="size-3.5" />
					<select
						value={task.status}
						onChange={(e) => onMove(e.target.value as TaskStatus)}
						aria-label={`Move “${task.title}” to another column`}
						className="absolute inset-0 cursor-pointer opacity-0"
					>
						{TASK_STATUSES.map((s) => (
							<option key={s} value={s}>
								{TASK_STATUS_META[s].label}
							</option>
						))}
					</select>
				</label>
			</div>
		</div>
	);
}

/** "+ Add task" that turns into an input; Enter adds and keeps it open for the next one. */
function QuickAdd({
	label,
	onAdd,
	pending,
	solo = false,
}: {
	label: string;
	onAdd: (title: string) => void;
	pending: boolean;
	solo?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");

	if (!open) {
		return solo ? (
			<Button icon={<LuPlus className="size-4" />} onClick={() => setOpen(true)}>
				{label}
			</Button>
		) : (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="mt-2 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs text-muted transition hover:bg-surface hover:text-fg"
			>
				<LuPlus className="size-3.5" />
				{label}
			</button>
		);
	}

	function submit() {
		const t = title.trim();
		if (!t) return;
		onAdd(t);
		setTitle("");
	}

	return (
		<form
			className={cn("mt-2", solo && "w-72")}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<input
				autoFocus
				value={title}
				maxLength={200}
				disabled={pending}
				onChange={(e) => setTitle(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setTitle("");
						setOpen(false);
					}
				}}
				onBlur={() => {
					if (!title.trim()) setOpen(false);
				}}
				placeholder="Task title, then Enter"
				aria-label="New task title"
				className={cn(inputClass, "py-1.5 text-sm")}
			/>
			<p className="mt-1 px-1 text-[10px] text-muted">Enter to add · Esc to close</p>
		</form>
	);
}

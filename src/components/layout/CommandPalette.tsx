import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
	LuFilePlus,
	LuFileText,
	LuFolderPlus,
	LuMoon,
	LuSearch,
	LuSettings,
	LuSun,
} from "react-icons/lu";

import { ProjectDot } from "@/components/project/ProjectTile";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { useTheme } from "@/contexts/theme/useTheme";
import { PROJECT_STATUS_META } from "@/lib/project/projectStatusStyles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchNotes } from "@/lib/api/notes";
import { fetchProjects } from "@/lib/api/projects";
import { noteKeys, projectKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Item = {
	key: string;
	group: "Actions" | "Projects" | "Notes";
	label: string;
	hint?: string;
	icon: ReactNode;
	run: () => void;
};

type CommandPaletteProps = {
	open: boolean;
	onClose: () => void;
	onCreateProject: () => void;
};

export function CommandPalette({ open, onClose, onCreateProject }: CommandPaletteProps) {
	return (
		<Dialog open={open} onClose={onClose} placement="top" ariaLabel="Search">
			{open ? <PaletteBody onClose={onClose} onCreateProject={onCreateProject} /> : null}
		</Dialog>
	);
}

function PaletteBody({ onClose, onCreateProject }: Omit<CommandPaletteProps, "open">) {
	const navigate = useNavigate();
	const { resolvedTheme, setTheme } = useTheme();
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	// Empty query: a few recent items. Typed query: server search on title + description/content.
	const q = useDebouncedValue(query.trim(), 200);
	const projectsQuery = useQuery({
		queryKey: [...projectKeys.all, "palette", q],
		queryFn: () => fetchProjects({ q: q || undefined, limit: 8, sort_by: "updated_at", sort_order: "desc" }),
		placeholderData: keepPreviousData,
	});
	const notesQuery = useQuery({
		queryKey: [...noteKeys.all, "palette", q],
		queryFn: () => fetchNotes({ q: q || undefined, limit: 8, sort_by: "updated_at", sort_order: "desc" }),
		placeholderData: keepPreviousData,
	});
	const projectsData = projectsQuery.data;
	const notesData = notesQuery.data;
	const searching = projectsQuery.isFetching || notesQuery.isFetching;

	const items = useMemo<Item[]>(() => {
		const go = (to: string) => () => {
			onClose();
			navigate(to);
		};
		const dark = resolvedTheme === "dark";
		const actions: Item[] = [
			{ key: "new-project", group: "Actions", label: "New project", icon: <LuFolderPlus />, run: () => { onClose(); onCreateProject(); } },
			{ key: "new-note", group: "Actions", label: "New note", icon: <LuFilePlus />, run: go("/notes/new") },
			{ key: "theme", group: "Actions", label: dark ? "Switch to light theme" : "Switch to dark theme", icon: dark ? <LuSun /> : <LuMoon />, run: () => { setTheme(dark ? "light" : "dark"); onClose(); } },
			{ key: "settings", group: "Actions", label: "Settings", icon: <LuSettings />, run: go("/settings/profile") },
		];
		const projects: Item[] = (projectsData?.projects ?? []).map((p) => ({
			key: `p-${p.id}`,
			group: "Projects",
			label: p.title,
			hint: PROJECT_STATUS_META[p.status].label,
			icon: <ProjectDot project={p} />,
			run: go(`/projects/${p.id}`),
		}));
		const notes: Item[] = (notesData?.notes ?? []).map((n) => ({
			key: `n-${n.id}`,
			group: "Notes",
			label: n.title?.trim() || "Untitled note",
			hint: n.project?.title ?? "Personal",
			icon: <LuFileText />,
			run: go(`/notes/${n.id}`),
		}));
		return [...actions, ...projects, ...notes];
	}, [projectsData, notesData, resolvedTheme, navigate, onClose, onCreateProject, setTheme]);

	// Projects and notes are already filtered by the server; only actions are matched here.
	const filtered = useMemo(() => {
		const text = query.trim().toLowerCase();
		if (!text) return items;
		return items.filter((i) => i.group !== "Actions" || i.label.toLowerCase().includes(text));
	}, [items, query]);

	useEffect(() => {
		listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
	}, [active]);

	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((i) => Math.min(filtered.length - 1, i + 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => Math.max(0, i - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			filtered[active]?.run();
		}
	}

	let lastGroup = "";
	return (
		<>
			<div className="flex items-center gap-3 border-b border-line px-4">
				{searching ? <Spinner className="size-4 text-muted" /> : <LuSearch className="size-4 text-muted" />}
				<input
					autoFocus
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setActive(0);
					}}
					onKeyDown={onKeyDown}
					placeholder="Search projects and notes, or type a command…"
					className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70"
					aria-label="Search"
				/>
				<kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">ESC</kbd>
			</div>
			<div ref={listRef} className="custom-scrollbar max-h-[50vh] overflow-y-auto p-1.5" role="listbox">
				{filtered.length === 0 ? (
					<p className="p-6 text-center text-sm text-muted">{searching ? "Searching…" : `No results for “${query}”`}</p>
				) : (
					filtered.map((item, i) => {
						const header = item.group !== lastGroup;
						lastGroup = item.group;
						return (
							<div key={item.key}>
								{header ? (
									<p className="px-2.5 pt-2.5 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase">
										{item.group}
									</p>
								) : null}
								<button
									type="button"
									role="option"
									aria-selected={i === active}
									data-index={i}
									onMouseMove={() => setActive(i)}
									onClick={item.run}
									className={cn(
										"flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
										i === active ? "bg-primary/10 text-primary" : "text-fg",
									)}
								>
									<span className="grid size-4 place-items-center text-muted [&>svg]:size-4">{item.icon}</span>
									<span className="flex-1 truncate">{item.label}</span>
									{item.hint ? <span className="text-[11px] text-muted">{item.hint}</span> : null}
								</button>
							</div>
						);
					})
				)}
			</div>
			<div className="hidden gap-4 border-t border-line bg-surface-2/50 px-4 py-2 text-[11px] text-muted sm:flex">
				<span>↑↓ to move</span>
				<span>↵ to open</span>
				<span>esc to close</span>
			</div>
		</>
	);
}

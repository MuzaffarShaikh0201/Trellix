import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
	MdChecklist,
	MdCode,
	MdEdit,
	MdFormatBold,
	MdFormatItalic,
	MdFormatListBulleted,
	MdFormatListNumbered,
	MdFormatQuote,
	MdHorizontalRule,
	MdImage,
	MdLink,
	MdStrikethroughS,
	MdTableChart,
	MdTerminal,
	MdVerticalSplit,
	MdVisibility,
} from "react-icons/md";

import { MarkdownContent } from "@/components/note/MarkdownContent";
import { cn } from "@/lib/utils";

export type MarkdownView = "edit" | "split" | "preview";

type MarkdownEditorPaneProps = {
	id?: string;
	value: string;
	onChange: (value: string) => void;
	view: MarkdownView;
	onViewChange: (view: MarkdownView) => void;
	placeholder?: string;
	autoFocus?: boolean;
	className?: string;
};

const VIEW_OPTIONS: { value: MarkdownView; label: string; icon: ReactNode }[] = [
	{ value: "edit", label: "Edit", icon: <MdEdit className="h-4 w-4" aria-hidden /> },
	{
		value: "split",
		label: "Split",
		icon: <MdVerticalSplit className="h-4 w-4" aria-hidden />,
	},
	{
		value: "preview",
		label: "Preview",
		icon: <MdVisibility className="h-4 w-4" aria-hidden />,
	},
];

const textareaBaseClass = cn(
	"w-full text-sm leading-relaxed text-text-primary outline-none",
	"placeholder:text-text-secondary",
	"[font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]",
);

type Selection = { start: number; end: number };

/** Computes the new text + selection after applying an inline wrap (e.g. **bold**). */
function applyWrap(
	value: string,
	sel: Selection,
	marker: string,
	placeholder: string,
): { value: string; selection: Selection } {
	const selected = value.slice(sel.start, sel.end) || placeholder;
	const next =
		value.slice(0, sel.start) +
		marker +
		selected +
		marker +
		value.slice(sel.end);
	const start = sel.start + marker.length;
	return { value: next, selection: { start, end: start + selected.length } };
}

/** Prefixes each selected line (e.g. "- ", "> ", "1. ") for block formatting. */
function applyLinePrefix(
	value: string,
	sel: Selection,
	prefix: (index: number) => string,
): { value: string; selection: Selection } {
	const lineStart = value.lastIndexOf("\n", sel.start - 1) + 1;
	const lineEnd =
		value.indexOf("\n", sel.end) === -1
			? value.length
			: value.indexOf("\n", sel.end);
	const block = value.slice(lineStart, lineEnd);
	const prefixed = block
		.split("\n")
		.map((line, i) => `${prefix(i)}${line}`)
		.join("\n");
	const next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
	return {
		value: next,
		selection: { start: lineStart, end: lineStart + prefixed.length },
	};
}

/** Inserts a block of text at the cursor, surrounded by blank lines. */
function insertBlock(
	value: string,
	sel: Selection,
	block: string,
): { value: string; selection: Selection } {
	const before = value.slice(0, sel.start);
	const after = value.slice(sel.end);
	const leading = before.length === 0 || before.endsWith("\n") ? "" : "\n";
	const trailing = after.length === 0 || after.startsWith("\n") ? "" : "\n";
	const insertion = `${leading}${block}${trailing}`;
	const next = before + insertion + after;
	const caret = before.length + insertion.length;
	return { value: next, selection: { start: caret, end: caret } };
}

const TABLE_TEMPLATE = `| Column | Column |\n| --- | --- |\n| Cell | Cell |`;

export function MarkdownEditorPane({
	id,
	value,
	onChange,
	view,
	onViewChange,
	placeholder = "Write your note in Markdown…",
	autoFocus = false,
	className,
}: MarkdownEditorPaneProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const pendingSelection = useRef<Selection | null>(null);

	// Restore caret/selection after a toolbar edit re-renders the textarea.
	useEffect(() => {
		if (!pendingSelection.current) return;
		const ta = textareaRef.current;
		if (ta) {
			ta.focus();
			ta.setSelectionRange(
				pendingSelection.current.start,
				pendingSelection.current.end,
			);
		}
		pendingSelection.current = null;
	}, [value]);

	const runCommand = useCallback(
		(
			fn: (
				value: string,
				sel: Selection,
			) => { value: string; selection: Selection },
		) => {
			const ta = textareaRef.current;
			const sel: Selection = ta
				? { start: ta.selectionStart, end: ta.selectionEnd }
				: { start: value.length, end: value.length };
			const result = fn(value, sel);
			pendingSelection.current = result.selection;
			onChange(result.value);
		},
		[value, onChange],
	);

	const commands: {
		key: string;
		label: string;
		icon: ReactNode;
		run: () => void;
	}[] = [
		{
			key: "bold",
			label: "Bold",
			icon: <MdFormatBold className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyWrap(v, s, "**", "bold text")),
		},
		{
			key: "italic",
			label: "Italic",
			icon: <MdFormatItalic className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyWrap(v, s, "*", "italic text")),
		},
		{
			key: "strike",
			label: "Strikethrough",
			icon: <MdStrikethroughS className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyWrap(v, s, "~~", "strikethrough")),
		},
		{
			key: "code",
			label: "Inline code",
			icon: <MdCode className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyWrap(v, s, "`", "code")),
		},
		{ key: "div-1", label: "", icon: null, run: () => {} },
		{
			key: "h1",
			label: "Heading 1",
			icon: <span className="text-[13px] font-semibold">H1</span>,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, () => "# ")),
		},
		{
			key: "h2",
			label: "Heading 2",
			icon: <span className="text-[13px] font-semibold">H2</span>,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, () => "## ")),
		},
		{
			key: "h3",
			label: "Heading 3",
			icon: <span className="text-[13px] font-semibold">H3</span>,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, () => "### ")),
		},
		{ key: "div-2", label: "", icon: null, run: () => {} },
		{
			key: "ul",
			label: "Bulleted list",
			icon: <MdFormatListBulleted className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, () => "- ")),
		},
		{
			key: "ol",
			label: "Numbered list",
			icon: <MdFormatListNumbered className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, (i) => `${i + 1}. `)),
		},
		{
			key: "task",
			label: "Task list",
			icon: <MdChecklist className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, () => "- [ ] ")),
		},
		{
			key: "quote",
			label: "Quote",
			icon: <MdFormatQuote className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => applyLinePrefix(v, s, () => "> ")),
		},
		{ key: "div-3", label: "", icon: null, run: () => {} },
		{
			key: "link",
			label: "Link",
			icon: <MdLink className="h-[18px] w-[18px]" aria-hidden />,
			run: () =>
				runCommand((v, s) => {
					const text = v.slice(s.start, s.end) || "link text";
					const insertion = `[${text}](url)`;
					const next = v.slice(0, s.start) + insertion + v.slice(s.end);
					const urlStart = s.start + text.length + 3;
					return {
						value: next,
						selection: { start: urlStart, end: urlStart + 3 },
					};
				}),
		},
		{
			key: "image",
			label: "Image",
			icon: <MdImage className="h-[18px] w-[18px]" aria-hidden />,
			run: () =>
				runCommand((v, s) => {
					const alt = v.slice(s.start, s.end) || "alt text";
					const insertion = `![${alt}](url)`;
					const next = v.slice(0, s.start) + insertion + v.slice(s.end);
					const urlStart = s.start + alt.length + 4;
					return {
						value: next,
						selection: { start: urlStart, end: urlStart + 3 },
					};
				}),
		},
		{
			key: "codeblock",
			label: "Code block",
			icon: <MdTerminal className="h-[18px] w-[18px]" aria-hidden />,
			run: () =>
				runCommand((v, s) => {
					const body = v.slice(s.start, s.end) || "code";
					return insertBlock(v, s, "```\n" + body + "\n```");
				}),
		},
		{
			key: "table",
			label: "Table",
			icon: <MdTableChart className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => insertBlock(v, s, TABLE_TEMPLATE)),
		},
		{
			key: "hr",
			label: "Divider",
			icon: <MdHorizontalRule className="h-[18px] w-[18px]" aria-hidden />,
			run: () => runCommand((v, s) => insertBlock(v, s, "---")),
		},
	];

	const showEditor = view === "edit" || view === "split";
	const showPreview = view === "preview" || view === "split";

	const editor = (
		<div
			className={cn(
				"flex min-h-0 min-w-0 flex-1 flex-col",
				view === "split" && "border-primary/10 md:border-r",
			)}
		>
			<div className="shrink-0 border-b border-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
				Write
			</div>
			<textarea
				id={id}
				ref={textareaRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoFocus={autoFocus}
				className={cn(
					textareaBaseClass,
					"custom-scrollbar min-h-0 flex-1 resize-none bg-background-secondary px-4 py-3",
				)}
			/>
		</div>
	);

	const preview = (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col">
			<div className="shrink-0 border-b border-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
				Preview
			</div>
			<div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3">
				{value.trim() ? (
					<MarkdownContent content={value} />
				) : (
					<p className="text-sm text-text-secondary">Nothing to preview yet.</p>
				)}
			</div>
		</div>
	);

	return (
		<div
			className={cn(
				"flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-primary/10 bg-background-secondary",
				className,
			)}
		>
			<div className="flex shrink-0 items-center gap-2 border-b border-primary/10 bg-tint/60 px-2 py-1.5">
				<div className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5">
					{showEditor
						? commands.map((cmd) =>
								cmd.icon === null ? (
									<span
										key={cmd.key}
										className="mx-1 h-5 w-px shrink-0 bg-primary/10"
										aria-hidden
									/>
								) : (
									<button
										key={cmd.key}
										type="button"
										onClick={cmd.run}
										title={cmd.label}
										aria-label={cmd.label}
										className={cn(
											"flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1 text-text-secondary transition-colors",
											"hover:bg-background-secondary hover:text-text-primary",
										)}
									>
										{cmd.icon}
									</button>
								),
							)
						: null}
				</div>

				<div
					className="flex shrink-0 rounded-lg border border-primary/15 bg-background-secondary p-0.5"
					role="group"
					aria-label="Editor view"
				>
					{VIEW_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => onViewChange(option.value)}
							className={cn(
								"inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
								view === option.value
									? "bg-tint text-text-primary shadow-sm"
									: "text-text-secondary hover:text-text-primary",
							)}
							aria-pressed={view === option.value}
							title={option.label}
						>
							{option.icon}
							<span className="hidden sm:inline">{option.label}</span>
						</button>
					))}
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col md:flex-row">
				{showEditor ? editor : null}
				{showPreview ? preview : null}
			</div>
		</div>
	);
}

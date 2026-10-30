import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
	LuBold,
	LuCode,
	LuImage,
	LuItalic,
	LuLink,
	LuList,
	LuListChecks,
	LuListOrdered,
	LuMinus,
	LuQuote,
	LuSquareTerminal,
	LuStrikethrough,
	LuTable,
} from "react-icons/lu";

import { MarkdownContent } from "@/components/note/MarkdownContent";
import { cn } from "@/lib/utils";

export type MarkdownView = "edit" | "split" | "preview";

type MarkdownEditorPaneProps = {
	id?: string;
	value: string;
	onChange: (value: string) => void;
	view: MarkdownView;
	placeholder?: string;
	autoFocus?: boolean;
	className?: string;
};

type Selection = { start: number; end: number };
type CommandFn = (value: string, sel: Selection) => { value: string; selection: Selection };

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
		apply: CommandFn | null;
	}[] = [
		{
			key: "bold",
			label: "Bold",
			icon: <LuBold className="size-4" aria-hidden />,
			apply: (v, s) => applyWrap(v, s, "**", "bold text"),
		},
		{
			key: "italic",
			label: "Italic",
			icon: <LuItalic className="size-4" aria-hidden />,
			apply: (v, s) => applyWrap(v, s, "*", "italic text"),
		},
		{
			key: "strike",
			label: "Strikethrough",
			icon: <LuStrikethrough className="size-4" aria-hidden />,
			apply: (v, s) => applyWrap(v, s, "~~", "strikethrough"),
		},
		{
			key: "code",
			label: "Inline code",
			icon: <LuCode className="size-4" aria-hidden />,
			apply: (v, s) => applyWrap(v, s, "`", "code"),
		},
		{ key: "div-1", label: "", icon: null, apply: null },
		{
			key: "h1",
			label: "Heading 1",
			icon: <span className="text-[13px] font-semibold">H1</span>,
			apply: (v, s) => applyLinePrefix(v, s, () => "# "),
		},
		{
			key: "h2",
			label: "Heading 2",
			icon: <span className="text-[13px] font-semibold">H2</span>,
			apply: (v, s) => applyLinePrefix(v, s, () => "## "),
		},
		{
			key: "h3",
			label: "Heading 3",
			icon: <span className="text-[13px] font-semibold">H3</span>,
			apply: (v, s) => applyLinePrefix(v, s, () => "### "),
		},
		{ key: "div-2", label: "", icon: null, apply: null },
		{
			key: "ul",
			label: "Bulleted list",
			icon: <LuList className="size-4" aria-hidden />,
			apply: (v, s) => applyLinePrefix(v, s, () => "- "),
		},
		{
			key: "ol",
			label: "Numbered list",
			icon: <LuListOrdered className="size-4" aria-hidden />,
			apply: (v, s) => applyLinePrefix(v, s, (i) => `${i + 1}. `),
		},
		{
			key: "task",
			label: "Task list",
			icon: <LuListChecks className="size-4" aria-hidden />,
			apply: (v, s) => applyLinePrefix(v, s, () => "- [ ] "),
		},
		{
			key: "quote",
			label: "Quote",
			icon: <LuQuote className="size-4" aria-hidden />,
			apply: (v, s) => applyLinePrefix(v, s, () => "> "),
		},
		{ key: "div-3", label: "", icon: null, apply: null },
		{
			key: "link",
			label: "Link",
			icon: <LuLink className="size-4" aria-hidden />,
			apply: (v, s) => {
					const text = v.slice(s.start, s.end) || "link text";
					const insertion = `[${text}](url)`;
					const next = v.slice(0, s.start) + insertion + v.slice(s.end);
					const urlStart = s.start + text.length + 3;
					return {
						value: next,
						selection: { start: urlStart, end: urlStart + 3 },
					};
				},
		},
		{
			key: "image",
			label: "Image",
			icon: <LuImage className="size-4" aria-hidden />,
			apply: (v, s) => {
					const alt = v.slice(s.start, s.end) || "alt text";
					const insertion = `![${alt}](url)`;
					const next = v.slice(0, s.start) + insertion + v.slice(s.end);
					const urlStart = s.start + alt.length + 4;
					return {
						value: next,
						selection: { start: urlStart, end: urlStart + 3 },
					};
				},
		},
		{
			key: "codeblock",
			label: "Code block",
			icon: <LuSquareTerminal className="size-4" aria-hidden />,
			apply: (v, s) => {
					const body = v.slice(s.start, s.end) || "code";
					return insertBlock(v, s, "```\n" + body + "\n```");
				},
		},
		{
			key: "table",
			label: "Table",
			icon: <LuTable className="size-4" aria-hidden />,
			apply: (v, s) => insertBlock(v, s, TABLE_TEMPLATE),
		},
		{
			key: "hr",
			label: "Divider",
			icon: <LuMinus className="size-4" aria-hidden />,
			apply: (v, s) => insertBlock(v, s, "---"),
		},
	];

	const showEditor = view === "edit" || view === "split";
	const showPreview = view === "preview" || view === "split";

	return (
		<div className={cn("flex min-h-0 flex-1", className)}>
			{showEditor ? (
				<div
					className={cn(
						"flex min-h-0 min-w-0 flex-1 flex-col",
						view === "split" && "border-line md:border-r",
					)}
				>
					<div
						className="custom-scrollbar flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-line px-3 py-1 md:px-6"
						role="toolbar"
						aria-label="Formatting"
					>
						{commands.map((cmd) =>
							cmd.icon === null ? (
								<span key={cmd.key} className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />
							) : (
								<button
									key={cmd.key}
									type="button"
									onClick={() => cmd.apply && runCommand(cmd.apply)}
									title={cmd.label}
									aria-label={cmd.label}
									className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
								>
									{cmd.icon}
								</button>
							),
						)}
					</div>
					<textarea
						id={id}
						ref={textareaRef}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={placeholder}
						autoFocus={autoFocus}
						spellCheck
						className="custom-scrollbar min-h-0 w-full flex-1 resize-none bg-transparent px-4 py-5 font-mono text-[13px] leading-7 text-fg outline-none placeholder:font-sans placeholder:text-muted/70 md:px-8"
					/>
				</div>
			) : null}
			{showPreview ? (
				<div
					className={cn(
						"custom-scrollbar min-w-0 flex-1 overflow-y-auto bg-surface/50",
						view === "split" && "max-md:hidden",
					)}
				>
					<div className="mx-auto max-w-3xl px-5 py-6 md:px-8">
						{value.trim() ? (
							<MarkdownContent content={value} className="text-[15px]" />
						) : (
							<p className="text-sm text-muted">Nothing to preview yet.</p>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}

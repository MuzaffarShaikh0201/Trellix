import type { MarkdownView } from "@/components/note/MarkdownEditorPane";

const VIEW_KEY = "trellix-editor-view";

/** Last editor view (Write / Split / Preview) the user picked. */
export function readEditorView(): MarkdownView {
	try {
		const v = localStorage.getItem(VIEW_KEY);
		return v === "edit" || v === "preview" || v === "split" ? v : "split";
	} catch {
		return "split";
	}
}

export function storeEditorView(v: MarkdownView) {
	try {
		localStorage.setItem(VIEW_KEY, v);
	} catch {
		/* storage unavailable */
	}
}

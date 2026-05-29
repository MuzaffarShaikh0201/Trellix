import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { cn } from "@/lib/utils";

type MarkdownContentProps = {
	content: string;
	className?: string;
};

function Heading({
	level,
	children,
}: {
	level: 1 | 2 | 3;
	children: ReactNode;
}) {
	const styles: Record<typeof level, string> = {
		1: "mt-5 mb-2 text-lg font-bold text-text-primary first:mt-0",
		2: "mt-5 mb-2 text-base font-semibold text-text-primary first:mt-0",
		3: "mt-4 mb-1.5 text-sm font-semibold text-text-primary first:mt-0",
	};
	const Tag = `h${level}` as const;
	return <Tag className={styles[level]}>{children}</Tag>;
}

/** Renders markdown using app typography/colors. Used for note preview and detail view. */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
	return (
		<div
			className={cn(
				"markdown-body text-sm leading-relaxed text-text-primary [word-break:break-word]",
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
				components={{
					h1: ({ children }) => <Heading level={1}>{children}</Heading>,
					h2: ({ children }) => <Heading level={2}>{children}</Heading>,
					h3: ({ children }) => <Heading level={3}>{children}</Heading>,
					h4: ({ children }) => <Heading level={3}>{children}</Heading>,
					p: ({ children }) => (
						<p className="my-2 first:mt-0 last:mb-0">{children}</p>
					),
					a: ({ href, children }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-primary underline-offset-2 hover:underline"
						>
							{children}
						</a>
					),
					ul: ({ children }) => (
						<ul className="my-2 list-disc space-y-1 pl-5 marker:text-text-secondary">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="my-2 list-decimal space-y-1 pl-5 marker:text-text-secondary">
							{children}
						</ol>
					),
					li: ({ children }) => <li className="pl-1">{children}</li>,
					blockquote: ({ children }) => (
						<blockquote className="my-3 border-l-2 border-primary/40 pl-3 italic text-text-secondary">
							{children}
						</blockquote>
					),
					code: ({
						className: codeClassName,
						children,
						...props
					}: ComponentPropsWithoutRef<"code">) => {
						const isBlock = /language-/.test(codeClassName ?? "");
						if (isBlock) {
							return (
								<code
									className={cn(
										"block whitespace-pre overflow-x-auto text-[0.8125rem] text-text-primary",
										codeClassName,
									)}
									{...props}
								>
									{children}
								</code>
							);
						}
						return (
							<code className="rounded bg-tint px-1.5 py-0.5 text-[0.8125rem] text-text-primary">
								{children}
							</code>
						);
					},
					pre: ({ children }) => (
						<pre className="my-3 overflow-x-auto rounded-lg border border-primary/10 bg-tint p-3">
							{children}
						</pre>
					),
					hr: () => <hr className="my-4 border-primary/10" />,
					table: ({ children }) => (
						<div className="my-3 overflow-x-auto">
							<table className="w-full border-collapse text-left text-[0.8125rem]">
								{children}
							</table>
						</div>
					),
					th: ({ children }) => (
						<th className="border border-primary/10 bg-tint px-2 py-1 font-semibold">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="border border-primary/10 px-2 py-1">{children}</td>
					),
					strong: ({ children }) => (
						<strong className="font-semibold text-text-primary">
							{children}
						</strong>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

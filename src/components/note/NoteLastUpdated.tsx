import { formatProjectDateTime } from "@/lib/project/formatProjectDate";
import { cn } from "@/lib/utils";

type NoteLastUpdatedProps = {
	updatedAt: string;
	className?: string;
	/** Use in inline meta rows (e.g. note detail header). */
	inline?: boolean;
};

export function NoteLastUpdated({
	updatedAt,
	className,
	inline = false,
}: NoteLastUpdatedProps) {
	const formatted = formatProjectDateTime(updatedAt);
	const Wrapper = inline ? "span" : "p";

	return (
		<Wrapper
			className={cn(
				inline ? "text-sm" : "text-xs",
				"text-text-secondary",
				className,
			)}
		>
			Last updated on{" "}
			<time
				dateTime={updatedAt}
				className="font-medium tabular-nums text-text-primary"
			>
				{formatted}
			</time>
		</Wrapper>
	);
}

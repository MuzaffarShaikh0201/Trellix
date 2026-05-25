import { useEffect, useId, useRef, useState } from "react";
import { MdExpandMore } from "react-icons/md";

import { ProjectStatusChip } from "@/components/project/ProjectStatusChip";
import { outlinedFieldLabelClass } from "@/components/ui/OutlinedField";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

export type OutlinedProjectStatusFieldProps = {
	label: string;
	value: ProjectStatus;
	onChange: (value: ProjectStatus) => void;
	options: { value: ProjectStatus; label: string }[];
	className?: string;
};

export function OutlinedProjectStatusField({
	label,
	value,
	onChange,
	options,
	className,
}: OutlinedProjectStatusFieldProps) {
	const id = useId();
	const listboxId = `${id}-listbox`;
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;

		const onPointerDown = (event: PointerEvent) => {
			if (
				rootRef.current &&
				!rootRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<div
			ref={rootRef}
			className={cn(
				"group/field relative flex w-full flex-col items-start justify-center gap-2",
				className,
			)}
		>
			<span id={`${id}-label`} className={outlinedFieldLabelClass}>
				{label}
			</span>
			<div
				className={cn(
					"flex w-full flex-row items-center justify-between rounded-lg border-2 bg-tint p-2",
					"border-tint transition-[border-color]",
					open ? "border-primary" : "group-focus-within/field:border-primary",
				)}
			>
				<button
					type="button"
					id={id}
					aria-labelledby={`${id}-label`}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={listboxId}
					onClick={() => setOpen((prev) => !prev)}
					className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left outline-none"
				>
					<ProjectStatusChip status={value} />
					<MdExpandMore
						className={cn(
							"h-[18px] w-[18px] shrink-0 text-text-secondary transition-colors",
							"group-hover/field:text-primary",
							open && "text-primary",
						)}
						aria-hidden
					/>
				</button>
			</div>

			{open ? (
				<ul
					id={listboxId}
					role="listbox"
					aria-labelledby={`${id}-label`}
					className={cn(
						"absolute left-0 top-full z-50 mt-1 w-full rounded-lg border-2",
						"border-primary/10 bg-background-secondary p-1 shadow-lg",
					)}
				>
					{options.map((option) => {
						const selected = option.value === value;

						return (
							<li key={option.value} role="presentation">
								<button
									type="button"
									role="option"
									aria-selected={selected}
									onClick={() => {
										onChange(option.value);
										setOpen(false);
									}}
									className={cn(
										"flex w-full cursor-pointer rounded-md px-2 py-1.5 text-left outline-none",
										"hover:bg-tint focus-visible:bg-tint focus-visible:ring-2 focus-visible:ring-primary/20",
										selected && "bg-tint",
									)}
								>
									<ProjectStatusChip status={option.value} />
								</button>
							</li>
						);
					})}
				</ul>
			) : null}
		</div>
	);
}

import { useId, useRef, type ReactNode } from "react";
import { MdCalendarToday, MdExpandMore } from "react-icons/md";

import { cn } from "@/lib/utils";

export const outlinedFieldLabelClass = "text-xs font-light text-text-primary";

/** Shared control height for single-line outlined fields (repo, dates, status, timestamps). */
export const outlinedFieldBoxClass = cn(
	"flex h-10 w-full flex-row items-center gap-2 rounded-lg border-2 bg-tint px-2",
	"border-tint transition-[border-color]",
	"group-focus-within/field:border-primary",
);

const controlClass = cn(
	"min-h-0 w-full flex-1 border-none bg-transparent text-sm leading-5 text-text-primary outline-none",
	"placeholder:text-sm placeholder:text-text-secondary",
);

type FieldShellProps = {
	label: string;
	id: string;
	className?: string;
	children: ReactNode;
};

function FieldShell({ label, id, className, children }: FieldShellProps) {
	return (
		<div
			className={cn(
				"group/field flex w-full flex-col items-start justify-center gap-2",
				className,
			)}
		>
			<label
				htmlFor={id}
				className={cn(
					outlinedFieldLabelClass,
					"group-focus-within/field:text-primary",
				)}
			>
				{label}
			</label>
			{children}
		</div>
	);
}

function FieldBox({
	children,
	trailing,
}: {
	children: ReactNode;
	trailing?: ReactNode;
}) {
	return (
		<div className={cn(outlinedFieldBoxClass, "justify-between")}>
			{children}
			{trailing ? (
				<span className="shrink-0 text-text-secondary">{trailing}</span>
			) : null}
		</div>
	);
}

export type OutlinedInputFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "url" | "date" | "datetime-local";
	placeholder?: string;
	className?: string;
};

export function OutlinedInputField({
	label,
	value,
	onChange,
	type = "text",
	placeholder = "",
	className,
}: OutlinedInputFieldProps) {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const isDate = type === "date" || type === "datetime-local";

	const openDatePicker = () => {
		const input = inputRef.current;
		if (!input) return;
		try {
			input.showPicker();
		} catch {
			input.focus();
		}
	};

	return (
		<FieldShell label={label} id={id} className={className}>
			<FieldBox
				trailing={
					isDate ? (
						<button
							type="button"
							tabIndex={-1}
							onClick={openDatePicker}
							className={cn(
								"shrink-0 cursor-pointer text-text-secondary transition-colors",
								"group-hover/field:text-primary",
							)}
							aria-label="Open calendar"
						>
							<MdCalendarToday className="h-[18px] w-[18px]" aria-hidden />
						</button>
					) : undefined
				}
			>
				<input
					ref={inputRef}
					id={id}
					type={type}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className={cn(
						controlClass,
						isDate && "input-hide-date-picker h-5 appearance-none",
					)}
				/>
			</FieldBox>
		</FieldShell>
	);
}

export type OutlinedTextAreaFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	className?: string;
};

export function OutlinedTextAreaField({
	label,
	value,
	onChange,
	placeholder = "",
	rows = 3,
	className,
}: OutlinedTextAreaFieldProps) {
	const id = useId();

	return (
		<FieldShell label={label} id={id} className={className}>
			<div
				className={cn(
					"w-full rounded-lg border-2 bg-tint p-2",
					"border-tint transition-[border-color]",
					"group-focus-within/field:border-primary",
				)}
			>
				<textarea
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					rows={rows}
					className={cn(controlClass, "resize-y")}
				/>
			</div>
		</FieldShell>
	);
}

export type OutlinedSelectOption<T extends string> = {
	value: T;
	label: string;
};

export type OutlinedSelectFieldProps<T extends string> = {
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: OutlinedSelectOption<T>[];
	className?: string;
};

export type OutlinedReadOnlyFieldProps = {
	label: string;
	value: string;
	dateTime?: string;
	className?: string;
};

export function OutlinedReadOnlyField({
	label,
	value,
	dateTime,
	className,
}: OutlinedReadOnlyFieldProps) {
	const id = useId();

	return (
		<div
			className={cn(
				"flex w-full flex-col items-start justify-center gap-2",
				className,
			)}
		>
			<span id={`${id}-label`} className={outlinedFieldLabelClass}>
				{label}
			</span>
			<div aria-labelledby={`${id}-label`} className={outlinedFieldBoxClass}>
				{dateTime ? (
					<time
						id={id}
						dateTime={dateTime}
						className={cn(controlClass, "block truncate")}
					>
						{value}
					</time>
				) : (
					<p id={id} className={cn(controlClass, "truncate")}>
						{value}
					</p>
				)}
			</div>
		</div>
	);
}

export function OutlinedSelectField<T extends string>({
	label,
	value,
	onChange,
	options,
	className,
}: OutlinedSelectFieldProps<T>) {
	const id = useId();

	return (
		<FieldShell label={label} id={id} className={className}>
			<FieldBox trailing={<MdExpandMore className="h-[18px] w-[18px]" aria-hidden />}>
				<select
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value as T)}
					className={cn(controlClass, "cursor-pointer appearance-none")}
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</FieldBox>
		</FieldShell>
	);
}

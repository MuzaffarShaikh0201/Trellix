import {
	useId,
	useState,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from "react";
import { LuChevronDown, LuEye, LuEyeOff } from "react-icons/lu";

import { inputClass, labelClass } from "@/components/ui/fieldStyles";
import { cn } from "@/lib/utils";

type FieldWrapProps = {
	label?: ReactNode;
	hint?: ReactNode;
	htmlFor: string;
	className?: string;
	children: ReactNode;
};

function FieldWrap({ label, hint, htmlFor, className, children }: FieldWrapProps) {
	return (
		<div className={className}>
			{label ? (
				<label htmlFor={htmlFor} className={labelClass}>
					{label}
				</label>
			) : null}
			{children}
			{hint ? <p className="mt-1.5 text-[11px] text-muted">{hint}</p> : null}
		</div>
	);
}

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
	label?: ReactNode;
	hint?: ReactNode;
	/** Icon shown inside the field on the left. */
	icon?: ReactNode;
	/** Element shown inside the field on the right. */
	trailing?: ReactNode;
	className?: string;
	inputClassName?: string;
};

export function TextField({
	label,
	hint,
	icon,
	trailing,
	className,
	inputClassName,
	type = "text",
	id,
	...props
}: TextFieldProps) {
	const autoId = useId();
	const inputId = id ?? autoId;
	const [reveal, setReveal] = useState(false);
	const isPassword = type === "password";

	const toggle = isPassword ? (
		<button
			type="button"
			onClick={() => setReveal((v) => !v)}
			className="text-muted transition-colors hover:text-fg"
			aria-label={reveal ? "Hide password" : "Show password"}
			tabIndex={-1}
		>
			{reveal ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
		</button>
	) : null;
	const right = trailing ?? toggle;

	return (
		<FieldWrap label={label} hint={hint} htmlFor={inputId} className={className}>
			<div className="relative">
				{icon ? (
					<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted [&>svg]:size-4">
						{icon}
					</span>
				) : null}
				<input
					id={inputId}
					type={isPassword && reveal ? "text" : type}
					className={cn(inputClass, icon && "pl-9", right && "pr-9", inputClassName)}
					{...props}
				/>
				{right ? (
					<span className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center">
						{right}
					</span>
				) : null}
			</div>
		</FieldWrap>
	);
}

type TextAreaFieldProps = Omit<ComponentPropsWithoutRef<"textarea">, "className"> & {
	label?: ReactNode;
	hint?: ReactNode;
	className?: string;
	inputClassName?: string;
};

export function TextAreaField({
	label,
	hint,
	className,
	inputClassName,
	id,
	...props
}: TextAreaFieldProps) {
	const autoId = useId();
	const inputId = id ?? autoId;
	return (
		<FieldWrap label={label} hint={hint} htmlFor={inputId} className={className}>
			<textarea id={inputId} className={cn(inputClass, "resize-none", inputClassName)} {...props} />
		</FieldWrap>
	);
}

export type SelectOption<T extends string> = { value: T; label: string };

type SelectFieldProps<T extends string> = {
	label?: ReactNode;
	value: T;
	onChange: (value: T) => void;
	options: SelectOption<T>[];
	disabled?: boolean;
	className?: string;
	selectClassName?: string;
	"aria-label"?: string;
};

export function SelectField<T extends string>({
	label,
	value,
	onChange,
	options,
	disabled,
	className,
	selectClassName,
	"aria-label": ariaLabel,
}: SelectFieldProps<T>) {
	const id = useId();
	return (
		<FieldWrap label={label} htmlFor={id} className={className}>
			<div className="relative">
				<select
					id={id}
					value={value}
					disabled={disabled}
					aria-label={ariaLabel}
					onChange={(e) => onChange(e.target.value as T)}
					className={cn(inputClass, "cursor-pointer appearance-none pr-9", selectClassName)}
				>
					{options.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
				<LuChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
			</div>
		</FieldWrap>
	);
}

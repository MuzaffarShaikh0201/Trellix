import {
	type ChangeEvent,
	type HTMLInputTypeAttribute,
	useId,
	useState,
} from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

import { cn } from "@/lib/utils";

export type FormFieldProps = {
	title: string;
	placeholder: string;
	type: HTMLInputTypeAttribute;
	value: string;
	handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
	autoComplete?: string;
	autoFocus?: boolean;
};

export default function FormField({
	title,
	placeholder,
	type,
	value,
	handleChange,
	autoComplete,
	autoFocus = false,
}: FormFieldProps) {
	const inputId = useId();
	const [isFocused, setIsFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const resolvedAutoComplete =
		autoComplete ??
		(type === "password"
			? "current-password"
			: type === "email"
				? "email"
				: undefined);

	const inputType =
		type === "password" && showPassword ? "text" : type;

	return (
		<div
			className="flex w-full flex-col items-start justify-center gap-2"
			onFocus={() => setIsFocused(true)}
			onBlur={() => setIsFocused(false)}
		>
			<label
				htmlFor={inputId}
				className={cn(
					"text-xs font-light",
					isFocused ? "text-primary" : "text-text-primary",
				)}
			>
				{title}
			</label>
			<div
				className={cn(
					"flex w-full flex-row items-center justify-between rounded-lg border-2 bg-tint p-2",
					isFocused ? "border-primary" : "border-tint",
				)}
			>
				<input
					id={inputId}
					type={inputType}
					className={cn(
						"border-none bg-tint text-xs text-text-primary outline-none placeholder:text-xs placeholder:text-text-secondary",
						type !== "password" ? "w-full" : "w-[90%]",
					)}
					value={value}
					onChange={handleChange}
					placeholder={placeholder}
					autoComplete={resolvedAutoComplete}
					autoFocus={autoFocus}
				/>
				{type === "password" && (
					<button
						type="button"
						className="cursor-pointer text-text-primary"
						aria-label={showPassword ? "Hide password" : "Show password"}
						onClick={() => setShowPassword((prev) => !prev)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
					>
						{showPassword ? (
							<IoMdEyeOff size={18} className="text-text-secondary" />
						) : (
							<IoMdEye size={18} className="text-text-secondary" />
						)}
					</button>
				)}
			</div>
		</div>
	);
}

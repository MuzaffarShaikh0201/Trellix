import {
	type ComponentPropsWithoutRef,
	isValidElement,
	type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"children"
> & {
	title: string;
	fill?: boolean;
	imgSrc?: string | ReactNode;
	/** When true with {@link loader}, only the loader is shown, centered. */
	loading?: boolean;
	loader?: ReactNode;
};

export default function Button({
	title,
	fill = true,
	type = "button",
	imgSrc,
	disabled = false,
	loading = false,
	loader,
	className,
	...props
}: ButtonProps) {
	const showLoaderOnly = Boolean(loading && loader);
	const isDisabled = disabled || loading;

	const visual =
		typeof imgSrc === "string" && imgSrc.length > 0 ? (
			<img src={imgSrc} alt="" className="h-6 w-auto shrink-0" />
		) : isValidElement(imgSrc) ? (
			imgSrc
		) : null;

	return (
		<button
			type={type}
			disabled={isDisabled}
			aria-busy={showLoaderOnly || undefined}
			className={cn(
				"w-full cursor-pointer rounded-md border-2 border-primary p-0.5 text-sm font-bold transition-colors",
				fill
					? "bg-primary text-white active:bg-blue-600"
					: "bg-transparent text-text-primary active:bg-primary",
				isDisabled && "pointer-events-none",
				isDisabled && !showLoaderOnly && "opacity-50",
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					"flex min-h-9 items-center justify-center gap-2",
					showLoaderOnly && "gap-0",
				)}
			>
				{showLoaderOnly ? (
					<span className="flex h-6 w-full items-center justify-center">
						{loader}
					</span>
				) : (
					<>
						<span>{title}</span>
						{visual}
					</>
				)}
			</div>
		</button>
	);
}

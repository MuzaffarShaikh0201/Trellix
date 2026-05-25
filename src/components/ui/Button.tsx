import {
	type ComponentPropsWithoutRef,
	isValidElement,
	type ReactNode,
} from "react";

import {
	buttonPrimaryClass,
	buttonSecondaryClass,
} from "@/components/ui/buttonStyles";
import { cn } from "@/lib/utils";

export type ButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"children"
> & {
	title: string;
	/** @deprecated Use `variant` instead. */
	fill?: boolean;
	variant?: "primary" | "secondary";
	imgSrc?: string | ReactNode;
	loading?: boolean;
	loader?: ReactNode;
};

function resolveVariant(
	variant: ButtonProps["variant"],
	fill: boolean,
): "primary" | "secondary" {
	if (variant === "primary" || variant === "secondary") return variant;
	return fill ? "primary" : "secondary";
}

export default function Button({
	title,
	fill = true,
	variant,
	type = "button",
	imgSrc,
	disabled = false,
	loading = false,
	loader,
	className,
	...props
}: ButtonProps) {
	const resolvedVariant = resolveVariant(variant, fill);
	const showLoaderOnly = Boolean(loading && loader);
	const isDisabled = disabled || loading;

	const visual =
		typeof imgSrc === "string" && imgSrc.length > 0 ? (
			<img src={imgSrc} alt="" className="h-4 w-auto shrink-0" />
		) : isValidElement(imgSrc) ? (
			imgSrc
		) : null;

	return (
		<button
			type={type}
			disabled={isDisabled}
			aria-busy={showLoaderOnly || undefined}
			className={cn(
				"w-full",
				resolvedVariant === "primary"
					? buttonPrimaryClass()
					: buttonSecondaryClass(),
				className,
			)}
			{...props}
		>
			{showLoaderOnly ? (
				<span className="flex items-center justify-center" aria-hidden>
					{loader}
				</span>
			) : (
				<>
					<span>{title}</span>
					{visual}
				</>
			)}
		</button>
	);
}

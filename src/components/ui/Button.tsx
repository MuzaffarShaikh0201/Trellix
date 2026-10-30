import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
	buttonDangerClass,
	buttonGhostClass,
	buttonPrimaryClass,
	buttonSecondaryClass,
} from "@/components/ui/buttonStyles";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const VARIANTS = {
	primary: buttonPrimaryClass,
	secondary: buttonSecondaryClass,
	ghost: buttonGhostClass,
	danger: buttonDangerClass,
};

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
	variant?: keyof typeof VARIANTS;
	icon?: ReactNode;
	loading?: boolean;
};

export default function Button({
	variant = "primary",
	type = "button",
	icon,
	loading = false,
	disabled,
	className,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			className={cn(VARIANTS[variant](), className)}
			{...props}
		>
			{loading ? <Spinner className="size-4" /> : icon}
			{children}
		</button>
	);
}

import { Link } from "react-router";

import { cn } from "@/lib/utils";

/** The Trellix layers logo (public/layers.svg). */
export function BrandMark({ className }: { className?: string }) {
	return (
		<img
			src="/layers.svg"
			alt=""
			aria-hidden
			width={32}
			height={32}
			decoding="async"
			className={cn("size-8 shrink-0", className)}
		/>
	);
}

export function AppBrand({ className }: { className?: string }) {
	return (
		<Link
			to="/"
			replace
			aria-label="Trellix home"
			className={cn(
				"flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
				className,
			)}
		>
			<BrandMark />
			<span className="truncate text-[15px] font-semibold tracking-tight">Trellix</span>
		</Link>
	);
}

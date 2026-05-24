import { Link } from "react-router";

export function AppBrand() {
	return (
		<Link
			to="/"
			className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
			aria-label="Trellix home"
		>
			<img
				src="/layers.svg"
				alt=""
				width={32}
				height={32}
				className="size-8 shrink-0"
				decoding="async"
			/>
			<span className="hidden truncate text-app-title font-bold tracking-tight text-text-primary sm:inline">
				Trellix
			</span>
		</Link>
	);
}

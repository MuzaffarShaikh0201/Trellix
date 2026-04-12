import {
	MdAdd,
	MdClose,
	MdMenu,
	MdNotificationsNone,
	MdSearch,
} from "react-icons/md";

import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

type TopNavProps = {
	menuOpen: boolean;
	onMenuToggle: () => void;
};

export function TopNav({ menuOpen, onMenuToggle }: TopNavProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-[60] flex h-14 shrink-0 items-center justify-between gap-2 border-b border-primary/10 bg-background-secondary px-3 sm:gap-4 sm:px-4 md:px-6",
			)}
		>
			<button
				type="button"
				className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-tint lg:hidden"
				aria-label={menuOpen ? "Close menu" : "Open menu"}
				aria-expanded={menuOpen}
				aria-controls="app-sidebar-nav"
				onClick={onMenuToggle}
			>
				{menuOpen ? (
					<MdClose className="h-6 w-6" aria-hidden />
				) : (
					<MdMenu className="h-6 w-6" aria-hidden />
				)}
			</button>
			<div className="relative min-w-0 max-w-xl flex-1">
				<MdSearch
					className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary"
					aria-hidden
				/>
				<input
					type="search"
					placeholder="Search projects, tasks, notes…"
					className={cn(
						"h-10 w-full rounded-full border border-transparent bg-tint py-2 pl-10 pr-4 text-sm text-text-primary",
						"placeholder:text-text-secondary",
						"outline-none transition-[box-shadow,border-color] focus:border-primary/25 focus:ring-2 focus:ring-primary/20",
					)}
					aria-label="Search"
				/>
			</div>

			<div className="flex shrink-0 items-center gap-1 sm:gap-2">
				<button
					type="button"
					className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-tint"
					aria-label="Quick add"
				>
					<MdAdd className="h-6 w-6" />
				</button>
				<button
					type="button"
					className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-tint"
					aria-label="Notifications"
				>
					<MdNotificationsNone className="h-6 w-6" />
					<span
						className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background-secondary"
						aria-hidden
					/>
				</button>
				<UserMenu />
			</div>
		</header>
	);
}

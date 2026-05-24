import {
	MdAdd,
	MdClose,
	MdNotificationsNone,
	MdSearch,
} from "react-icons/md";

import { AppBrand } from "@/components/layout/AppBrand";
import { HeaderNavDivider } from "@/components/layout/HeaderNavDivider";
import { SidebarToggleIcon } from "@/components/layout/SidebarToggleIcon";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

type TopNavProps = {
	menuOpen: boolean;
	onMenuToggle: () => void;
	onMenuPointerEnter: () => void;
	onMenuPointerLeave: () => void;
};

export function TopNav({
	menuOpen,
	onMenuToggle,
	onMenuPointerEnter,
	onMenuPointerLeave,
}: TopNavProps) {
	return (
		<header
			className={cn(
				"relative z-[60] flex h-14 shrink-0 items-center gap-2 border-b border-primary/10 bg-background-secondary px-3 sm:gap-3 sm:px-4 md:gap-4 md:px-6",
			)}
		>
			<div className="flex min-w-0 shrink-0 items-center">
				<AppBrand />
				<div
					className="ml-3 flex shrink-0 items-center sm:ml-20"
					onPointerEnter={onMenuPointerEnter}
					onPointerLeave={onMenuPointerLeave}
				>
					<button
						type="button"
						className={cn(
							"flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-primary transition-colors",
							"hover:bg-tint",
							menuOpen && "bg-tint",
						)}
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						aria-expanded={menuOpen}
						aria-controls="app-sidebar-nav"
						onClick={onMenuToggle}
					>
						{menuOpen ? (
							<MdClose className="h-6 w-6" aria-hidden />
						) : (
							<SidebarToggleIcon className="h-6 w-6" />
						)}
					</button>
				</div>
				<HeaderNavDivider className="ml-4 hidden sm:flex" />
			</div>

			<div className="min-w-0 flex-1" aria-hidden />

			<div className="flex shrink-0 items-center gap-1 sm:gap-2">
				<button
					type="button"
					className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-tint"
					aria-label="Search"
				>
					<MdSearch className="h-6 w-6" aria-hidden />
				</button>
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

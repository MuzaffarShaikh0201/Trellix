import { NavLink } from "react-router";

const year = new Date().getFullYear();

const footerLinkClass =
	"text-text-secondary transition-colors hover:text-text-primary";

export function AppFooter() {
	return (
		<footer className="hidden shrink-0 border-t border-primary/10 bg-tint px-4 py-1 md:block md:px-6">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
				<p className="text-[10px] leading-tight text-text-secondary sm:text-xs">
					&copy; Trellix&trade; {year}
				</p>

				<nav
					className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] leading-tight sm:text-xs"
					aria-label="Legal and support"
				>
					<NavLink to="/contact" className={footerLinkClass}>
						Contact us
					</NavLink>
					<span className="text-text-secondary/50" aria-hidden>
						|
					</span>
					<NavLink to="/legal" className={footerLinkClass}>
						Terms of use &amp; Privacy policy
					</NavLink>
				</nav>
			</div>
		</footer>
	);
}

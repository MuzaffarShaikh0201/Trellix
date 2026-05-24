type SidebarToggleIconProps = {
	className?: string;
};

/** Panel menu: three lines with expand chevron on the top line (reference layout). */
export function SidebarToggleIcon({ className }: SidebarToggleIconProps) {
	return (
		<svg
			className={className}
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<path
				d="M5.5 5.5L8 8M5.5 10.5L8 8M8 8H20"
				stroke="currentColor"
				strokeWidth={1.75}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M4 12h16M4 17h16"
				stroke="currentColor"
				strokeWidth={1.75}
				strokeLinecap="round"
			/>
		</svg>
	);
}

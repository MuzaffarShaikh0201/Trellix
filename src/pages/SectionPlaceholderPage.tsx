type SectionPlaceholderPageProps = {
	title: string;
};

export function SectionPlaceholderPage({ title }: SectionPlaceholderPageProps) {
	return (
		<div>
			<h1 className="text-2xl font-bold text-text-primary">{title}</h1>
			<p className="mt-2 text-sm text-text-secondary">
				This section is coming soon.
			</p>
		</div>
	);
}
